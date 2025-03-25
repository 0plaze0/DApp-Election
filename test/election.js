let Election = artifacts.require("./Election.sol");

contract("Election", function(accounts){

    let electionInstance;

    it("initializes with two candidates", function(){
        return Election.deployed().then(function(instance){
            return instance.candidatesCount()
        }).then(function(count){
            assert.equal(count, 2);
        })
    })

    it("it initialized the candidates with the correct values", function(){
        return Election.deployed().then(function(instance){
            electionInstance = instance;
            return electionInstance.candidates(1);
        }).then(function(candidate){
            assert.equal(candidate[0], 1, "contains the correct id")
            assert.equal(candidate[1], 'Candidate 1', "contains the correct name")
            assert.equal(candidate[2], 0, "contains the correct vote count")
            return electionInstance.candidates(2);
        }).then(function(candidate){
            assert.equal(candidate[0], 2, "contains the correct id")
            assert.equal(candidate[1], 'Candidate 2', "contains the correct name")
            assert.equal(candidate[2], 0, "contains the correct vote count")
        })
    })

    it("allow a voter to cast a vote", function(){
        return Election.deployed().then(function(instance){
            electionInstance = instance;
            candidateId = 1;

           
            return electionInstance.vote(candidateId, {from: accounts[0]})
        }).then(function(receipt){
            return electionInstance.voters(accounts[0]);
        }).then(function(voter){
            assert(voter, "Then vote a casted")
            return electionInstance.candidates(candidateId);
        }).then(function(candidate){
            assert.equal(candidate[2], 1, "Vote a incremented");
        })
    })

    it("throwing an expection for invalid candidate", function(){
        return Election.deployed().then(function(instance){
            electionInstance = instance;
            candidateId = 99;

            return electionInstance.vote(candidateId, {from: accounts[1]})
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0, "Error msg contains revert")
            return electionInstance.candidates(1);
        }).then(function(candidate){
            assert.equal(candidate[2], 1 , "Vote of Candidate 1 was not incremented due to invalid candidate");
            return electionInstance.candidates(2);
        }).then(function(candidate){
            assert.equal(candidate[2], 0 , "Vote of Candidate 2 was not incremented due to error");
        })
    })

})