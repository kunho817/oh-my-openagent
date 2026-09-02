import { resolve } from "node:path";
import type { ValidateQualityGateOptions } from "./quality-gate.js";
import { isRecord } from "./quality-gate-fields.js";
import { UlwLoopError } from "./types.js";

type Defect = { readonly field: string; readonly message: string };
const PLACEHOLDER = /^(?:<replace:[^>]+>|placeholder|todo|tbd|n\/a|stub)$/i;

function add(defects: Defect[], field: string, message: string): void {
	defects.push({ field, message });
}
function text(value: unknown, field: string, defects: Defect[]): void {
	if (typeof value !== "string" || value.trim() === "")
		add(defects, field, `Final quality gate requires non-empty ${field}.`);
	else if (PLACEHOLDER.test(value.trim())) add(defects, field, `Final quality gate rejects placeholder ${field}.`);
}
function section(value: unknown, field: string, defects: Defect[]): Record<string, unknown> {
	if (!isRecord(value)) {
		add(defects, field, `Final quality gate is missing ${field} evidence.`);
		return {};
	}
	return value;
}

function requiredArray(value: unknown, field: string, defects: Defect[]): readonly unknown[] {
	if (!Array.isArray(value) || value.length === 0) add(defects, field, `Final quality gate requires ${field}.`);
	return Array.isArray(value) ? value : [];
}

function emptyArray(value: unknown, field: string, defects: Defect[]): void {
	if (!Array.isArray(value) || value.length !== 0) add(defects, field, `${field} must be empty.`);
}

function literal(value: unknown, expected: string | boolean, field: string, defects: Defect[]): void {
	if (value !== expected) add(defects, field, `${field} must be ${String(expected)}.`);
}

function reviewer(value: unknown, field: string, accepted: readonly string[], defects: Defect[]): void {
	if (typeof value !== "string" || !accepted.includes(value))
		add(defects, field, `${field} must be one of ${accepted.join(", ")}.`);
}

export function aggregateQualityGateDefects(input: unknown, opts: ValidateQualityGateOptions | undefined): void {
	if (!isRecord(input)) return;
	const defects: Defect[] = [];
	const surface = opts?.reviewerSurface ?? "lazycodex";
	const gate = input;
	const manual = section(gate["manualQa"], "manualQa", defects);
	const review = section(gate["gateReview"], "gateReview", defects);
	const iteration = section(gate["iteration"], "iteration", defects);
	const coverage = section(gate["criteriaCoverage"], "criteriaCoverage", defects);
	if (surface === "omo-senpi") {
		if (gate["codeReview"] !== undefined) add(defects, "codeReview", "omo-senpi gate has no codeReview lane.");
	} else {
		const codeReview = section(gate["codeReview"], "codeReview", defects);
		reviewer(codeReview["by"], "codeReview.by", ["lazycodex-code-reviewer"], defects);
	}
	text(manual["evidence"], "manualQa.evidence", defects);
	text(review["evidence"], "gateReview.evidence", defects);
	reviewer(
		manual["by"],
		"manualQa.by",
		surface === "omo-senpi" ? ["main-session"] : ["lazycodex-qa-executor"],
		defects,
	);
	reviewer(
		review["by"],
		"gateReview.by",
		surface === "omo-senpi"
			? ["category:deep", "category:unspecified-high", "category:unspecified-low"]
			: ["lazycodex-gate-reviewer"],
		defects,
	);
	if (review["recommendation"] !== "APPROVE")
		add(defects, "gateReview.recommendation", "gateReview.recommendation must be APPROVE.");
	text(review["reportPath"], "gateReview.reportPath", defects);
	emptyArray(review["blockers"], "gateReview.blockers", defects);
	literal(iteration["fullRerun"], true, "iteration.fullRerun", defects);
	literal(iteration["status"], "passed", "iteration.status", defects);
	text(iteration["evidence"], "iteration.evidence", defects);
	requiredArray(iteration["rerunCommands"], "iteration.rerunCommands", defects);
	for (const field of ["originalIntent", "desiredOutcome", "userOutcomeReview"])
		text(coverage[field], `criteriaCoverage.${field}`, defects);
	for (const field of ["totalCriteria", "passCount"]) {
		if (typeof coverage[field] !== "number" || !Number.isFinite(coverage[field]))
			add(defects, `criteriaCoverage.${field}`, `Final quality gate requires numeric criteriaCoverage.${field}.`);
	}
	if (
		typeof coverage["totalCriteria"] === "number" &&
		typeof coverage["passCount"] === "number" &&
		coverage["passCount"] < coverage["totalCriteria"]
	)
		add(defects, "criteriaCoverage.passCount", "criteriaCoverage.passCount must cover totalCriteria.");
	requiredArray(coverage["adversarialClassesCovered"], "criteriaCoverage.adversarialClassesCovered", defects);
	const artifacts = requiredArray(manual["artifactRefs"], "manualQa.artifactRefs", defects);
	for (const [index, item] of artifacts.entries()) {
		if (!isRecord(item)) {
			add(
				defects,
				`manualQa.artifactRefs[${index}]`,
				`Final quality gate requires manualQa.artifactRefs[${index}] evidence.`,
			);
			continue;
		}
		for (const field of ["id", "kind", "description", "path"])
			text(item[field], `manualQa.artifactRefs[${index}].${field}`, defects);
		const path = item["path"];
		if (typeof path !== "string" || path.trim() === "") continue;
		if (opts?.repoRoot !== undefined && opts.fs !== undefined && !opts.fs.existsSync(resolve(opts.repoRoot, path)))
			add(
				defects,
				`manualQa.artifactRefs[${index}].path`,
				`manualQa.artifactRefs[${index}].path must point to an existing artifact.`,
			);
	}
	if (defects.length === 0) return;
	const truncated = defects.length > 25;
	const fields = defects.slice(0, 25).map(({ field, message }) => ({ field, message }));
	const message = [
		`Final quality gate has ${fields.length}${truncated ? "+" : ""} validation defects:`,
		...fields.map((item) => `- ${item.field}: ${item.message}`),
	].join("\n");
	throw new UlwLoopError(message, "ULW_LOOP_QUALITY_GATE_INVALID", {
		details: { field: fields[0]?.field, fields, ...(truncated ? { truncated: true } : {}) },
	});
}
