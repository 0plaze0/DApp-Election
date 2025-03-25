pragma solidity >=0.4.22 <0.8.0;

contract Election{
    //Model a Candidate
    struct Candidate{
        uint id;
        string name;
        uint voteCount;
    }

    //Read/Write Candidate
    mapping(uint => Candidate) public candidates;
    //Store the account of voters
    mapping(address => bool) public voters;
   
    
    uint public candidatesCount;

    constructor() public{
        addCandidate("Candidate 1");
        addCandidate("Candidate 2");
    }

    function addCandidate(string memory _name) private {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

     //vote and update the voter has voted and update vote count of candiate
    function vote(uint _candidateId) public {
        //check if voter has voted
        require(!voters[msg.sender]);
        //check if candiate id is valid
        require(_candidateId > 0 && _candidateId <= candidatesCount);
        //voter can't vote anymore
        voters[msg.sender] = true;
        //vote the candidate
        candidates[_candidateId].voteCount++;
    }
    
}