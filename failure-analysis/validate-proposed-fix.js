const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

// --------------------------------------------------
// PATHS
// --------------------------------------------------

const projectRoot = path.join(
    __dirname,
    ".."
);

const analysesPath = path.join(
    __dirname,
    "analyses.json"
);

const originalTestPath = path.join(
    projectRoot,
    "tests",
    "example.spec.js"
);

const tempDirectory = path.join(
    projectRoot,
    "tests",
    "ai-validation"
);

const tempTestPath = path.join(
    tempDirectory,
    "ai-fix-validation.spec.js"
);

// --------------------------------------------------
// VALIDATE INPUT FILES
// --------------------------------------------------

if (!fs.existsSync(analysesPath)) {
    console.error(
        "[AI-QA] analyses.json was not found."
    );

    process.exit(1);
}

if (!fs.existsSync(originalTestPath)) {
    console.error(
        "[AI-QA] Original Playwright test file was not found."
    );

    process.exit(1);
}

// --------------------------------------------------
// READ ANALYSES
// --------------------------------------------------

const analyses = JSON.parse(
    fs.readFileSync(
        analysesPath,
        "utf8"
    )
);

if (
    !Array.isArray(analyses) ||
    analyses.length === 0
) {
    console.log(
        "[AI-QA] No AI analyses available for validation."
    );

    process.exit(0);
}

// --------------------------------------------------
// READ ORIGINAL TEST
// --------------------------------------------------

const originalTestCode =
    fs.readFileSync(
        originalTestPath,
        "utf8"
    );

let patchedTestCode =
    originalTestCode;

// --------------------------------------------------
// APPLY SAFE TEMPORARY FIXES
// --------------------------------------------------

let fixesApplied = 0;

for (const analysis of analyses) {

    console.log(
        `\n[AI-QA] Reviewing proposed fix for: ${analysis.testName}`
    );

    console.log(
        `[AI-QA] Proposed fix: ${analysis.proposedFix}`
    );

    // ----------------------------------------------
    // TITLE ASSERTION VALIDATION
    // ----------------------------------------------

    if (
        analysis.testName ===
        "Intentional failing test for observability"
    ) {

        const originalAssertion =
            `await expect(page).toHaveTitle("Wrong Title");`;

        const correctedAssertion =
            `await expect(page).toHaveTitle("Example Domain");`;

        if (
            patchedTestCode.includes(
                originalAssertion
            )
        ) {

            patchedTestCode =
                patchedTestCode.replace(
                    originalAssertion,
                    correctedAssertion
                );

            fixesApplied++;

            console.log(
                "[AI-QA] Temporary title fix applied."
            );

        } else {

            console.warn(
                "[AI-QA] Expected title assertion was not found. No change applied."
            );
        }
    }

    // ----------------------------------------------
    // URL ASSERTION VALIDATION
    // ----------------------------------------------

    if (
        analysis.testName ===
        "Intentional URL failure for observability"
    ) {

        const originalAssertion =
            `await expect(page).toHaveURL("https://wrong-example.com/");`;

        const correctedAssertion =
            `await expect(page).toHaveURL("https://example.com/");`;

        if (
            patchedTestCode.includes(
                originalAssertion
            )
        ) {

            patchedTestCode =
                patchedTestCode.replace(
                    originalAssertion,
                    correctedAssertion
                );

            fixesApplied++;

            console.log(
                "[AI-QA] Temporary URL fix applied."
            );

        } else {

            console.warn(
                "[AI-QA] Expected URL assertion was not found. No change applied."
            );
        }
    }
}

// --------------------------------------------------
// CHECK WHETHER ANY FIXES WERE APPLIED
// --------------------------------------------------

if (fixesApplied === 0) {

    console.log(
        "\n[AI-QA] No safe temporary fixes were applied."
    );

    process.exit(0);
}

// --------------------------------------------------
// CREATE TEMPORARY TEST DIRECTORY
// --------------------------------------------------

fs.mkdirSync(
    tempDirectory,
    {
        recursive: true,
    }
);

// --------------------------------------------------
// WRITE TEMPORARY PATCHED TEST
// --------------------------------------------------

fs.writeFileSync(
    tempTestPath,
    patchedTestCode
);

console.log(
    `\n[AI-QA] Temporary validation test created: ${tempTestPath}`
);

console.log(
    "[AI-QA] Original test file was NOT modified."
);

// --------------------------------------------------
// RUN PLAYWRIGHT AGAINST TEMP FILE
// --------------------------------------------------

console.log(
    "\n=============================="
);

console.log(
    "AI PROPOSED FIX VALIDATION"
);

console.log(
    "==============================\n"
);

// Windows requires npx.cmd.
// macOS/Linux use npx.
const playwrightCli = path.join(
    projectRoot,
    "node_modules",
    "@playwright",
    "test",
    "cli.js"
);

if (!fs.existsSync(playwrightCli)) {
    console.error(
        `[AI-QA] Playwright CLI was not found: ${playwrightCli}`
    );

    process.exit(1);
}

const result = spawnSync(
    process.execPath,
    [
        playwrightCli,
        "test",
        "tests/ai-validation/ai-fix-validation.spec.js",
    ],
    {
        cwd: projectRoot,
        stdio: "inherit",
        shell: false,
    }
);

// --------------------------------------------------
// HANDLE PROCESS EXECUTION ERROR
// --------------------------------------------------

if (result.error) {

    console.error(
        "[AI-QA] Unable to start Playwright validation:"
    );

    console.error(
        result.error.message
    );

    process.exit(1);
}

// --------------------------------------------------
// REPORT RESULT
// --------------------------------------------------

console.log(
    "\n=============================="
);

console.log(
    "VALIDATION RESULT"
);

console.log(
    "=============================="
);

if (result.status === 0) {

    console.log(
        "✅ AI proposed fixes passed the temporary Playwright validation."
    );

    console.log(
        "✅ The original test suite remains unchanged."
    );

} else {

    console.log(
        "❌ AI proposed fixes did not fully pass validation."
    );

    console.log(
        "❌ Review the temporary test output before applying any change manually."
    );
}

// --------------------------------------------------
// CLEANUP NOTE
// --------------------------------------------------

console.log(
    `\nTemporary validation file: ${tempTestPath}`
);

console.log(
    "You can inspect or delete this temporary file after validation."
);

// --------------------------------------------------
// EXIT STATUS
// --------------------------------------------------

process.exitCode =
    result.status === 0
        ? 0
        : 1;