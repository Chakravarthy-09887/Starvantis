import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node/index.cjs';
import fs from 'fs';
import path from 'path';

const dir = path.resolve('.');

async function main() {
  console.log('Working in directory:', dir);

  // Initialize git repo if not already initialized
  try {
    await git.init({ fs, dir });
    console.log('Git repo initialized.');
  } catch (err) {
    console.log('Init error / already initialized:', err.message);
  }

  // Check remotes
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
    console.log('Remote error:', err.message);
  }

  // Get status of files
  console.log('Checking status matrix...');
  const matrix = await git.statusMatrix({ fs, dir });
  console.log(`Found ${matrix.length} tracked/untracked items.`);

  // Stage all modified/untracked files (except ignored)
  for (const [filepath, head, worktree, stage] of matrix) {
    if (filepath.startsWith('.git') || filepath.startsWith('node_modules') || filepath.startsWith('.next')) {
      continue;
    }
    if (worktree === 2 || worktree === 1) {
      await git.add({ fs, dir, filepath });
    } else if (worktree === 0 && head === 1) {
      await git.remove({ fs, dir, filepath });
    }
  }
  console.log('Files staged.');

  // Commit
  try {
    const sha = await git.commit({
      fs,
      dir,
      message: 'Initial commit: STARVANTIS Aerospace Intelligence Platform with Live Milky Way Custom Cursor',
      author: {
        name: 'Quantum Squad',
        email: 'quantumsquad@starvantis.space',
      },
    });
    console.log('Committed SHA:', sha);
  } catch (err) {
    console.log('Commit note:', err.message);
  }
}

main().catch(console.error);
