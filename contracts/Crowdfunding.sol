// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

contract Crowdfunding {
    string public projectName;
    string public projectDescription;
    uint256 public goal;
    uint256 public totalFunded;
    string public state;
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
        state = "open";
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

    event ProjectStateChanged(string newState);

    function fundProject() public payable notOwner {
        require(msg.value > 0, "You have to send something");
        require(totalFunded < goal, "Goal already achieved!");
        require(
            msg.value <= goal - totalFunded,
            "Amount exceeded, please check viewRemaining"
        );
        totalFunded += msg.value;

        emit ProjectFunded(msg.sender, msg.value);
    }

    function changeProjectState(string calldata _newState) public onlyOwner {
        state = _newState;
        emit ProjectStateChanged(_newState);
    }

    function viewRemaining() public view returns (uint256) {
        return goal - totalFunded;
    }
}
