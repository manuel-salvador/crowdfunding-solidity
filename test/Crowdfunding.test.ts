import { expect } from 'chai';
import { ethers } from 'hardhat';
import type { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import type { Crowdfunding } from '../typechain-types';

describe('Crowdfunding', async function () {
  let crowdfunding: Crowdfunding;
  let projectOwner: SignerWithAddress;
  let investor: SignerWithAddress;

  beforeEach(async function () {
    [projectOwner, investor] = await ethers.getSigners();
    const Crowdfunding = await ethers.getContractFactory('Crowdfunding');
    crowdfunding = await Crowdfunding.deploy();
    await crowdfunding.deployed();

    const goal = ethers.utils.parseUnits('2', 'ether');
    await crowdfunding.createProject('manuProjectId', 'manu project', 'mi descripcion', goal);
  });

  describe('Fund project function', async function () {
    it('Fund project with 1 ETH', async function () {
      // Parse ether units to wei
      const amount = ethers.utils.parseEther('1');
      // Inverstor send 1 ETH
      await crowdfunding.connect(investor).fundProject(0, { value: amount });

      // Get total funded
      const totalFunded = await crowdfunding.getTotalFunded(0);

      // Verify that totalFunded matches with amount sended
      expect(totalFunded).to.equal(amount);
    });

    it('Fund project function Event', async function () {
      // Parse ether units to wei
      const amount = ethers.utils.parseUnits('1', 'ether');

      const [firstProject] = await crowdfunding.getAllProjects();

      // Inverstor send 1 ETH
      await expect(crowdfunding.connect(investor).fundProject(0, { value: amount }))
        .to.emit(crowdfunding, 'ProjectFunded')
        .withArgs(firstProject.id, investor.address, amount);
    });

    describe('Should revert when there is an error trying to fund the project', async function () {
      it('Should revert when owner tries to send funds to their own project', async function () {
        // Parse ether units to wei
        const amount = ethers.utils.parseUnits('1', 'ether');
        // Owner send 1 ETH
        await expect(crowdfunding.fundProject(0, { value: amount })).to.be.revertedWith(
          'You can not fund your own project'
        );
      });

      it('Should revert when the goal has already been achieved', async function () {
        // Parse ether units to wei
        const amount = ethers.utils.parseUnits('2', 'ether');
        // Inverstor send 2 ETH
        crowdfunding.connect(investor).fundProject(0, { value: amount });
        // Inverstor send 2 ETH again
        await expect(
          crowdfunding.connect(investor).fundProject(0, { value: amount })
        ).to.be.revertedWith('Goal already achieved!');
      });

      it('Should revert when excess ether is sent', async function () {
        // Parse ether units to wei
        const amount = ethers.utils.parseUnits('3', 'ether');
        // Inverstor send 3 ETH
        await expect(
          crowdfunding.connect(investor).fundProject(0, { value: amount })
        ).to.be.revertedWith('Amount exceeded, please check viewRemaining');
      });

      it('Should revert when sending 0 ether', async function () {
        // Parse ether units to wei
        const amount = ethers.utils.parseUnits('0', 'ether');
        // Inverstor send 1 ETH
        await expect(
          crowdfunding.connect(investor).fundProject(0, { value: amount })
        ).to.be.revertedWith('You have to send something');
      });

      it('Should revert when project state is not active(1)', async function () {
        await crowdfunding.changeProjectState(0, 0);

        const amount = ethers.utils.parseUnits('1', 'ether');
        await expect(
          crowdfunding.connect(investor).fundProject(0, { value: amount })
        ).to.be.revertedWith("Can't found, the project is not active");
      });
    });
  });

  describe('Change project state function', async function () {
    it('Change project state to closed(0)', async function () {
      await crowdfunding.changeProjectState(0, 0);

      const projectState = await crowdfunding.getState(0);

      expect(projectState).to.equal(0);
    });

    it('Change project state function Event', async function () {
      const [firstProject] = await crowdfunding.getAllProjects();

      await expect(crowdfunding.changeProjectState(0, 0))
        .to.emit(crowdfunding, 'ProjectStateChanged')
        .withArgs(firstProject.id, projectOwner.address, 0);
    });

    describe('Should revert when there is an error trying to change the project state', async function () {
      it('Should revert when the sender is not the project wallet', async function () {
        await expect(crowdfunding.connect(investor).changeProjectState(0, 0)).to.be.revertedWith(
          'You need to be the owner of the project'
        );
      });

      it('Should revert when tries to change the state with same value', async function () {
        await expect(crowdfunding.changeProjectState(0, 1)).to.be.rejectedWith(
          "Can't change state with same value"
        );
      });
    });
  });

  describe('Create project function', async function () {
    it('Create new project', async function () {
      const projectId = 'secondProjectId';
      const goal = ethers.utils.parseUnits('2', 'ether');

      await crowdfunding.createProject(projectId, 'second project', 'mi descripcion', goal);
      const projects = await crowdfunding.getAllProjects();

      expect(projects[1].id).to.equal(projectId);
    });
  });
});

// Test end to end

describe('Crowdfunding end to end', async function () {
  let crowdfunding: Crowdfunding;
  let projectOwner: SignerWithAddress;
  let investor: SignerWithAddress;
  // Parse ether units to wei
  const amount = ethers.utils.parseEther('1');

  before(async function () {
    [projectOwner, investor] = await ethers.getSigners();
    const Crowdfunding = await ethers.getContractFactory('Crowdfunding');
    crowdfunding = await Crowdfunding.deploy();
    await crowdfunding.deployed();
  });

  it('Create new project', async function () {
    const goal = ethers.utils.parseUnits('2', 'ether');
    await crowdfunding.createProject('manuProjectId', 'manu project', 'mi descripcion', goal);
  });

  it('Fund project with 1 ETH', async function () {
    // Inverstor send 1 ETH
    await crowdfunding.connect(investor).fundProject(0, { value: amount });
    // Get total funded
    const totalFunded = await crowdfunding.getTotalFunded(0);
    // Verify that totalFunded matches with amount sended
    expect(totalFunded).to.equal(amount);
  });

  it('Check investments', async function () {
    const firstInvestment = await crowdfunding.investments('manuProjectId', 0);
    expect(firstInvestment.investor).to.equal(investor.address);
    expect(firstInvestment.value).to.equal(amount);

    await crowdfunding.connect(investor).fundProject(0, { value: amount });
    const firstProject = await crowdfunding.projects(0);
    const expectedAmount = amount.add(amount);
    expect(firstProject.totalFunded).to.equal(expectedAmount);
  });
});

function inversorInvest() {
  console.log('first');
}
