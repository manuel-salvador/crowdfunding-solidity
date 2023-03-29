// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

contract Crowdfunding {
    enum ProjectState {
        Inactive,
        Active,
        Paused
    }

    struct Investment {
        address investor;
        uint256 value;
    }

    struct Project {
        string id;
        string name;
        string description;
        uint256 goal;
        uint256 totalFunded;
        ProjectState state;
        address payable owner;
    }

    Project[] public projects;

    mapping(string projectId => Investment[]) public investments;

    modifier onlyOwner(uint256 projectIndex) {
        require(
            msg.sender == projects[projectIndex].owner,
            "You need to be the owner of the project"
        );
        _;
    }

    modifier notOwner(uint256 projectIndex) {
        require(
            msg.sender != projects[projectIndex].owner,
            "You can not fund your own project"
        );
        _;
    }

    event ProjectFunded(string projectId, address investor, uint256 amount);

    event ProjectStateChanged(
        string projectId,
        address owner,
        ProjectState newState
    );

    function createProject(
        string calldata _id,
        string calldata _projectName,
        string calldata _projectDescription,
        uint256 _goal
    ) public {
        require(_goal > 0, "Goal must be greater than 0");
        Project memory newProject = Project(
            _id,
            _projectName,
            _projectDescription,
            _goal,
            0,
            ProjectState.Active,
            payable(msg.sender)
        );
        projects.push(newProject);
    }

    function fundProject(
        uint256 _projectIndex
    ) public payable notOwner(_projectIndex) {
        Project memory project = projects[_projectIndex];

        require(msg.value > 0, "You have to send something");
        require(project.totalFunded < project.goal, "Goal already achieved!");
        require(
            msg.value <= project.goal - project.totalFunded,
            "Amount exceeded, please check viewRemaining"
        );
        require(
            project.state == ProjectState.Active,
            "Can't found, the project is not active"
        );

        projects[_projectIndex].totalFunded += msg.value;

        investments[project.id].push(Investment(msg.sender, msg.value));

        emit ProjectFunded(project.id, msg.sender, msg.value);
    }

    function changeProjectState(
        uint256 _projectIndex,
        ProjectState _newState
    ) public onlyOwner(_projectIndex) {
        Project memory project = projects[_projectIndex];
        require(
            project.state != _newState,
            "Can't change state with same value"
        );
        projects[_projectIndex].state = _newState;
        emit ProjectStateChanged(project.id, msg.sender, _newState);
    }

    function viewRemaining(
        uint256 _projectIndex
    ) public view returns (uint256) {
        Project memory project = projects[_projectIndex];
        return project.goal - project.totalFunded;
    }

    // Gettters
    function getTotalFunded(
        uint256 _projectIndex
    ) public view returns (uint256) {
        return projects[_projectIndex].totalFunded;
    }

    function getState(
        uint256 _projectIndex
    ) public view returns (ProjectState) {
        return projects[_projectIndex].state;
    }

    function getAllProjects() public view returns (Project[] memory) {
        return projects;
    }
}
