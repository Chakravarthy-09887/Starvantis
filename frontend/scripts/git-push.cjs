const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');
const path = require('path');

const dir = path.resolve('.');

async function main() {
  console.log('Working directory:', dir);

  // Initialize git repo
  try {
    await git.init({ fs, dir });
    console.log('Git repo initialized.');
  } catch (err) {
    console.log('Init error:', err.message);
  }

  // Add remote origin
  try {
    const remotes = await git.listRemotes({ fs, dir });
    console.log('Current remotes:', remotes);
    const hasOrigin = remotes.some(r => r.remote === 'origin');
    if (!hasOrigin) {
      await git.addRemote({
        fs,
        dir,
        remote: 'origin',
        url: 'https://github.com/DharshiniK-13/starvantis.git'
      });
      console.log('Remote origin added: https://github.com/DharshiniK-13/starvantis.git');
    }
  } catch (err) {
    console.log('Remote note:', err.message);
  }

  // Get status of files
  console.log('Scanning files...');
  const matrix = await git.statusMatrix({ fs, dir });
  console.log(`Found ${matrix.length} items in status matrix.`);

  let stagedCount = 0;
  for (const [filepath, head, worktree, stage] of matrix) {
    if (filepath.startsWith('.git') || filepath.startsWith('node_modules') || filepath.startsWith('.next')) {
      continue;
    }
    if (worktree === 2 || worktree === 1) {
      await git.add({ fs, dir, filepath });
      stagedCount++;
    } else if (worktree === 0 && head === 1) {
      await git.remove({ fs, dir, filepath });
    }
  }
  console.log(`Staged ${stagedCount} files.`);

  // Commit
  try {
    const sha = await git.commit({
      fs,
      dir,
      message: 'feat: STARVANTIS Aerospace Intelligence Platform with Live Milky Way Custom Cursor',
      author: {
        name: 'Quantum Squad',
        email: 'quantumsquad@starvantis.space',
      },
    });
    console.log('Committed successfully. SHA:', sha);
  } catch (err) {
    console.log('Commit note:', err.message);
  }
}

main().catch(console.error);
