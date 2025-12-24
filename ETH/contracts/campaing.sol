
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;


contract BuildingCommitteeFactory {
    address[] public deployedCommittees;

    function createCommittee(uint256 minimumContributionWei) public {
        address newCommittee = address(
            new BuildingCommittee(minimumContributionWei, msg.sender)
        );
        deployedCommittees.push(newCommittee);
    }

    function getDeployedCommittees() public view returns (address[] memory) {
        return deployedCommittees;
    }
}

contract BuildingCommittee {
    struct Request {
        string description;
        uint256 value; // wei
        address payable recipient;
        bool complete;
        uint256 approvalCount;
        mapping(address => bool) approvals; 
    }

    address public manager;
    uint256 public minimumContribution; // wei
    mapping(address => bool) public approvers;
    uint256 public approversCount;

    Request[] public requests;

    modifier onlyManager() {
        require(msg.sender == manager, "Only manager can call this");
        _;
    }

    constructor(uint256 minimumContributionWei, address creator) {
        manager = creator;
        minimumContribution = minimumContributionWei;
    }

    // --- Contribute ---
    function contribute() public payable {
        require(msg.value >= minimumContribution, "Contribution too small");

        // count each address only once
        if (!approvers[msg.sender]) {
            approvers[msg.sender] = true;
            approversCount++;
        }
    }

    // --- Requests API for Frontend ---
    function getRequestsCount() public view returns (uint256) {
        return requests.length;
    }

    
    function getRequest(uint256 index)
        public
        view
        returns (
            string memory description,
            uint256 value,
            address recipient,
            bool complete,
            uint256 approvalCount
        )
    {
        require(index < requests.length, "Bad index");
        Request storage r = requests[index];
        return (r.description, r.value, r.recipient, r.complete, r.approvalCount);
    }

    //Has user already aprooved-UI
    function hasApproved(uint256 index, address user) public view returns (bool) {
        require(index < requests.length, "Bad index");
        return requests[index].approvals[user];
    }

    // --- Manager actions ---
    function createRequest(
        string memory description,
        uint256 value,
        address payable recipient
    ) public onlyManager {
        require(value > 0, "Value must be > 0");
        require(recipient != address(0), "Bad recipient");

        Request storage newRequest = requests.push();
        newRequest.description = description;
        newRequest.value = value;
        newRequest.recipient = recipient;
        newRequest.complete = false;
        newRequest.approvalCount = 0;
    }

    // --- Approver action ---
    function approveRequest(uint256 index) public {
        require(approvers[msg.sender], "Not an approver");
        require(index < requests.length, "Bad index");

        Request storage request = requests[index];

        require(!request.complete, "Request already completed");
        require(!request.approvals[msg.sender], "Already approved"); // no double-approve

        request.approvals[msg.sender] = true;
        request.approvalCount++;
    }

    // --- Finalize (Manager) ---
    function finalizeRequest(uint256 index) public onlyManager {
    require(index < requests.length, "Bad index");

    Request storage request = requests[index];

    require(!request.complete, "Request already completed");
    require(request.approvalCount > (approversCount / 2), "Not enough approvals");
    require(address(this).balance >= request.value, "Insufficient balance");

    request.complete = true;

    (bool ok, ) = request.recipient.call{value: request.value}("");
    require(ok, "Transfer failed");
}

}
