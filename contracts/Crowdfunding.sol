// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

contract Crowdfunding {
    enum State {
        Inactive,
        Active,
        Paused
    }

    struct Project {
        string name;
        string description;
        uint256 goal;
        uint256 totalFunded;
        State state;
        address payable owner;
    }

    Project public project;

    constructor(
        string memory _projectName,
        string memory _projectDescription,
        uint256 _goal
    ) {
        project = Project(
            _projectName,
            _projectDescription,
            _goal,
            0,
            State.Active,
            payable(msg.sender)
        );
    }

    modifier onlyOwner() {
        require(
            msg.sender == project.owner,
            "You need to be the owner of the project"
        );
        _;
    }

    modifier notOwner() {
        require(
            msg.sender != project.owner,
            "You can not fund your own project"
        );
        _;
    }

    event ProjectFunded(address investor, uint256 amount);

    event ProjectStateChanged(address owner, State newState);

    function fundProject() public payable notOwner {
        require(msg.value > 0, "You have to send something");
        require(project.totalFunded < project.goal, "Goal already achieved!");
        require(
            msg.value <= project.goal - project.totalFunded,
            "Amount exceeded, please check viewRemaining"
        );
        require(
            project.state == State.Active,
            "Can't found, the project is not active"
        );
        project.totalFunded += msg.value;

        emit ProjectFunded(msg.sender, msg.value);
    }

    function changeProjectState(State _newState) public onlyOwner {
        require(
            project.state != _newState,
            "Can't change state with same value"
        );
        project.state = _newState;
        emit ProjectStateChanged(msg.sender, _newState);
    }

    function viewRemaining() public view returns (uint256) {
        return project.goal - project.totalFunded;
    }

    // Gettters
    function getTotalFunded() public view returns (uint256) {
        return project.totalFunded;
    }

    function getState() public view returns (State) {
        return project.state;
    }
}
