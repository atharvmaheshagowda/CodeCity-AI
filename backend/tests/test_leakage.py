"""
Test No Data Leakage:
Proves that features extracted at cutoff time T strictly NEVER use or observe
any commits occurring after cutoff time T, even when new future commits with massive churn
and bug fixes are introduced.
"""

import os
import shutil
import tempfile
from datetime import datetime, timezone, timedelta
import pandas as pd
import pytest

from mining.synthetic_repo import create_synthetic_git_repo, get_synthetic_cutoff, _run_git
from mining.git_miner import RepoFeatureMiner

def test_no_data_leakage():
    temp_dir = tempfile.mkdtemp(prefix="codecity_leakage_test_")
    try:
        # Step 1: Create a synthetic git repo with 180 days of history
        create_synthetic_git_repo(temp_dir, "leakage_test_repo")
        cutoff_t = get_synthetic_cutoff(temp_dir)

        # Step 2: Extract features at cutoff T
        miner1 = RepoFeatureMiner(temp_dir, cutoff_t, future_window_days=90)
        df1 = miner1.extract_dataset().sort_values("file_path").reset_index(drop=True)

        feature_cols = [
            "loc", "mean_complexity", "max_complexity", "commit_count",
            "distinct_authors", "file_age_days", "days_since_last_change",
            "churn_90d", "total_churn", "past_bug_fixes", "fan_in", "fan_out"
        ]

        # Verify dataset is not empty
        assert len(df1) > 0, "Initial dataset should contain active files"

        # Step 3: Inject massive future commits occurring AFTER cutoff T
        # (e.g. Day 150 = cutoff_t + 60 days)
        future_date = (cutoff_t + timedelta(days=60)).isoformat()
        env = {
            "GIT_AUTHOR_NAME": "Future Attacker",
            "GIT_AUTHOR_EMAIL": "future@leak.test",
            "GIT_AUTHOR_DATE": future_date,
            "GIT_COMMITTER_NAME": "Future Attacker",
            "GIT_COMMITTER_EMAIL": "future@leak.test",
            "GIT_COMMITTER_DATE": future_date,
        }

        # Modify the first file with 500 lines of churn and a bug fix commit message
        target_file_rel = df1["file_path"].iloc[0]
        target_file_full = os.path.join(temp_dir, target_file_rel)
        with open(target_file_full, "a", encoding="utf-8") as f:
            f.write("\n# Future modification\n" + "\n".join([f"def future_fn_{i}(): pass" for i in range(100)]))

        _run_git(["add", target_file_rel], cwd=temp_dir)
        _run_git(["commit", "-m", f"Fix massive critical bug #999 in {target_file_rel} with 500 lines added"], cwd=temp_dir, env=env)

        # Step 4: Re-extract dataset with the EXACT same cutoff T
        miner2 = RepoFeatureMiner(temp_dir, cutoff_t, future_window_days=90)
        df2 = miner2.extract_dataset().sort_values("file_path").reset_index(drop=True)

        # Step 5: Assert that EVERY feature is strictly identical
        assert len(df1) == len(df2), "Number of files before cutoff T must remain identical"
        for col in feature_cols:
            pd.testing.assert_series_equal(
                df1[col],
                df2[col],
                check_exact=False,
                rtol=1e-5,
                obj=f"Feature '{col}' must be 100% immune to commits after T"
            )

        # target_file_rel was touched by a future bug-fix commit, so its label should be 1
        target_row = df2[df2["file_path"] == target_file_rel]
        assert not target_row.empty
        assert target_row.iloc[0]["label"] == 1, "Future bug-fix commit must be reflected in post-T label"

    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)
