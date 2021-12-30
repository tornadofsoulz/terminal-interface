import { TerminalError } from 'utils/API/errors/TerminalError/TerminalError';
import {
  stakingAddress,
  network,
  tokenAddress,
} from 'config/config';
import { BigNumber, ethers } from 'ethers';
import STAKING_ABI from './abi/staking.json';
import ERC20_ABI from './abi/erc20.json';

export const stake = async (amount: BigNumber): Promise<string[]> => {
  if (!window.ethereum || !window.ethereum!.isMetaMask) {
    throw new TerminalError({ code: 'NO_METAMASK' });
  }
  if (!window.ethereum.request) {
    throw new TerminalError({ code: 'METAMASK_WRONG_NETWORK' });
  }
  const chainId: string = await window.ethereum.request({ method: 'net_version' });
  if (chainId !== network) {
    throw new TerminalError({ code: 'METAMASK_WRONG_NETWORK' });
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const erc20 = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
  const approve = await erc20.approve(stakingAddress, amount);
  const approveReceipt = await approve.wait();
  const contract = new ethers.Contract(stakingAddress, STAKING_ABI, signer);
  const tx = await contract.mint(amount, await signer.getAddress());
  const receipt = await tx.wait();
  return [approveReceipt.transactionHash, receipt.transactionHash];
};

export const unstake = async (amount: BigNumber): Promise<string> => {
  if (!window.ethereum || !window.ethereum!.isMetaMask) {
    throw new TerminalError({ code: 'NO_METAMASK' });
  }
  if (!window.ethereum.request) {
    throw new TerminalError({ code: 'METAMASK_WRONG_NETWORK' });
  }
  const chainId: string = await window.ethereum.request({ method: 'net_version' });
  if (chainId !== network) {
    throw new TerminalError({ code: 'METAMASK_WRONG_NETWORK' });
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(stakingAddress, STAKING_ABI, signer);
  const share = await contract.balanceToShare(amount);
  const tx = await contract.burn(await signer.getAddress(), share);
  const receipt = await tx.wait();
  return receipt.transactionHash;
};
