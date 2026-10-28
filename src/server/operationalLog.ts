// Server-only operational events. Error payloads may contain credentials or PII.
function emit(level: "error" | "warn", message: string, error?: unknown) {
	const code =
		error && typeof error === "object" && "code" in error
			? String(error.code)
			: "";
	console.log(
		JSON.stringify({
			level,
			event: "upstream_error",
			message,
			...(/^(?:E[A-Z0-9_]{2,40}|ORA-\d{5})$/.test(code)
				? { error_code: code }
				: {}),
		})
	);
}
export const operationalLog = {
	error: (message: string, error?: unknown) => emit("error", message, error),
	warn: (message: string, error?: unknown) => emit("warn", message, error),
};
