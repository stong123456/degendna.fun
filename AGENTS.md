# DegenDNA product and audit requirements

For work on Play, Mental Lab, Reset, question banks or personal records:

- Read `docs/product-lines/PRODUCT.md` and `docs/product-lines/AUDIT.md` before changes. Keep their scope and implementation status accurate.
- Maintain three explicit product paths: entertainment, private self-observation, practical tools. Do not use mental-health answers for entertainment cards, wallet rankings, NFTs or marketing.
- Original questionnaires are provisional editorial designs. Do not claim validation, diagnosis, risk prediction, treatment efficacy or financial outcomes. Never fabricate user research or professional approval.
- Preserve existing question IDs and semantics. Semantic, response-scale or observation-period changes require a new module version and historical comparison isolation.
- Explain results from actual valid answers; missing and skipped answers are not zero. Burden and resources do not cancel. Explicit life impact and rare safety concerns must not be hidden by averages.
- Local persistence requires an explicit user action. Do not upload answers, free text or local records, and do not automatically attach them to AI requests. Explain local storage and backup limits accurately.
- Run `npm test` and `npm run audit:product`. For UI changes, exercise affected flows in an actual browser at desktop and mobile sizes and inspect console plus screenshots. Record unverified cases as unverified.
- Before a release, inspect all links and controls, storage failure paths, consent, deletion, restoration, versioning and safety navigation. Follow the fixed audit document. Do not replace this with a build-only claim.
- User interviews, independent professional review and empirical validation are human research tasks. Keep them as explicit pending milestones until evidence exists.
- Production publishing, payment activation and cloud storage must have a concrete reviewed configuration; do not simulate success or add secret placeholders that appear operational.
