// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

contract Crowdfunding {
    string public projectName;
    string public projectDescription;
    uint256 public goal;
    uint256 public totalFunded;
    uint256 public state;
    address payable public projectOwner;

    constructor(
        string memory _projectName,
        string memory _projectDescription,
        uint256 _goal
    ) {
        projectName = _projectName;
        projectDescription = _projectDescription;
        goal = _goal;
        totalFunded = 0;
        state = 1;
        projectOwner = payable(msg.sender);
    }

    modifier onlyOwner() {
        require(
            msg.sender == projectOwner,
            "You need to be the owner of the project"
        );
        _;
    }

    modifier notOwner() {
        require(
            msg.sender != projectOwner,
            "You can not fund your own project"
        );
        _;
    }

    event ProjectFunded(address investor, uint256 amount);

    event ProjectStateChanged(address owner, uint256 newState);

    function fundProject() public payable notOwner {
        require(msg.value > 0, "You have to send something");
        require(totalFunded < goal, "Goal already achieved!");
        require(
            msg.value <= goal - totalFunded,
            "Amount exceeded, please check viewRemaining"
        );
        require(state == 1, "Can't found, the project is not active");
        totalFunded += msg.value;

        emit ProjectFunded(msg.sender, msg.value);
    }

    function changeProjectState(uint256 _newState) public onlyOwner {
        require(state != _newState, "Can't change state with same value");
        state = 0;
        emit ProjectStateChanged(msg.sender, _newState);
    }

    function viewRemaining() public view returns (uint256) {
        return goal - totalFunded;
    }
}
