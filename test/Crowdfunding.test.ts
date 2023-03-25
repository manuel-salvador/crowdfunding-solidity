import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('Crowdfunding', async function () {
  let crowdfunding: any;
  let projectOwner: any;
  let investor: any;
  const projectName: string = 'Caritas felices';
  const projectDescription: string = 'Este es un proyecto de ejemplo';
  const goal: any = ethers.utils.parseUnits('2', 'ether');

  beforeEach(async function () {
    [projectOwner, investor] = await ethers.getSigners();
    const Crowdfunding = await ethers.getContractFactory('Crowdfunding');
    crowdfunding = await Crowdfunding.deploy(projectName, projectDescription, goal);
    await crowdfunding.deployed();
  });

  describe('Fund project function', async function () {
    it('Fund project with 1 ETH', async function () {
      // Parse ether units to wei
      const amount = ethers.utils.parseUnits('1', 'ether');
      // Inverstor send 1 ETH
      await crowdfunding.connect(investor).fundProject({ value: amount });

      // Get total funded
      const totalFunded = await crowdfunding.totalFunded();

      // Verify that totalFunded matches with amount sended
      expect(totalFunded).to.equal(amount);
    });

    describe('Should revert when there is an error trying to fund the project', async function () {
      it('Should revert when owner tries to send funds to their own project', async function () {
        // Parse ether units to wei
        const amount = ethers.utils.parseUnits('0', 'ether');
        // Owner send 1 ETH
        await expect(crowdfunding.fundProject({ value: amount })).to.be.revertedWith(
          'You can not fund your own project'
        );
      });

      it('Should revert when sending 0 ether', async function () {
        // Parse ether units to wei
        const amount = ethers.utils.parseUnits('0', 'ether');
        // Inverstor send 1 ETH
        await expect(
          crowdfunding.connect(investor).fundProject({ value: amount })
        ).to.be.revertedWith('You have to send something');
      });

      it('Should revert when the goal has already been achieved', async function () {
        // Parse ether units to wei
        const amount = ethers.utils.parseUnits('2', 'ether');
        // Inverstor send 2 ETH
        crowdfunding.connect(investor).fundProject({ value: amount });
        // Inverstor send 2 ETH again
        await expect(
          crowdfunding.connect(investor).fundProject({ value: amount })
        ).to.be.revertedWith('Goal already achieved!');
      });

      it('Should revert when excess ether is sent', async function () {
        // Parse ether units to wei
        const amount = ethers.utils.parseUnits('3', 'ether');
        // Inverstor send 3 ETH
        await expect(
          crowdfunding.connect(investor).fundProject({ value: amount })
        ).to.be.revertedWith('Amount exceeded, please check viewRemaining');
      });
    });
  });

  describe('Change project state', async function () {
    it('Should set state to inactive', async function () {
      await crowdfunding.changeProjectState(false);

      const projectState = await crowdfunding.isActive();

      expect(projectState).to.equal(false);
    });

    it('Should revert because the sender is not the project wallet', async function () {
      await expect(crowdfunding.connect(investor).changeProjectState(false)).to.be.revertedWith(
        'You need to be the owner of the project'
      );
    });
  });
});
