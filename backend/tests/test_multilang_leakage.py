"""
Test Multi-Language Temporal Leakage Prevention.

Proves that features extracted at cutoff time T for non-Python repositories
(JavaScript, TypeScript, Go, Java, C) strictly NEVER observe or leak information
from future commits occurring after cutoff time T, even when massive churn
and post-cutoff bug fixes are introduced.
"""

import os
import shutil
import tempfile
from datetime import datetime, timezone, timedelta
import pandas as pd
import pytest

from mining.synthetic_repo import create_synthetic_git_repo, get_synthetic_cutoff, _run_git
from mining.git_miner import RepoFeatureMiner
from ml.features import CORE_FEATURE_COLUMNS


@pytest.mark.parametrize("repo_type,lang", [
    ("express", "javascript"),
    ("zod", "typescript"),
    ("cobra", "go"),
    ("gson", "java"),
    ("c", "c"),
])
def test_multilang_no_data_leakage(repo_type, lang):
    temp_dir = tempfile.mkdtemp(prefix=f"codecity_leakage_{repo_type}_")
    try:
        # Step 1: Create a synthetic git repo with 180 days of history
        create_synthetic_git_repo(temp_dir, repo_type)
        cutoff_t = get_synthetic_cutoff(temp_dir)

        # Step 2: Extract features at cutoff T
        miner1 = RepoFeatureMiner(temp_dir, cutoff_t, future_window_days=90)
        df1 = miner1.extract_dataset().sort_values("file_path").reset_index(drop=True)

        assert len(df1) > 0, f"Dataset for {repo_type} should contain active files"
        assert all(col in df1.columns for col in CORE_FEATURE_COLUMNS), "All core features must be present"

        # Step 3: Inject massive future commits occurring AFTER cutoff T (Day 150)
        future_date = (cutoff_t + timedelta(days=60)).isoformat()
        env = {
            "GIT_AUTHOR_NAME": "Future Attacker",
            "GIT_AUTHOR_EMAIL": "future@leak.test",
            "GIT_AUTHOR_DATE": future_date,
            "GIT_COMMITTER_NAME": "Future Attacker",
            "GIT_COMMITTER_EMAIL": "future@leak.test",
            "GIT_COMMITTER_DATE": future_date,
        }

        target_file_rel = df1["file_path"].iloc[0]
        target_file_full = os.path.join(temp_dir, target_file_rel)
        with open(target_file_full, "a", encoding="utf-8") as f:
            f.write("\n// Massive future injection\n" + "\n".join([f"// future line {i}" for i in range(250)]))

        _run_git(["add", target_file_rel], cwd=temp_dir)
        _run_git(["commit", "-m", f"Fix massive critical bug #9999 in {target_file_rel}"], cwd=temp_dir, env=env)

        # Step 4: Re-extract dataset with the EXACT same cutoff T
        miner2 = RepoFeatureMiner(temp_dir, cutoff_t, future_window_days=90)
        df2 = miner2.extract_dataset().sort_values("file_path").reset_index(drop=True)

        # Step 5: Strict Assertions - Features must be 100% IDENTICAL
        assert len(df1) == len(df2), "Active file count at cutoff T must not change"

        for col in CORE_FEATURE_COLUMNS:
            val1 = df1[col].values
            val2 = df2[col].values
            assert (val1 == val2).all(), (
                f"Data leakage detected in feature '{col}' for {repo_type}! "
                f"Cutoff values altered by future commit."
            )

    finally:
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir, ignore_errors=True)
