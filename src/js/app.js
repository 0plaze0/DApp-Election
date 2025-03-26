const App = {
    web3Provider: null,
    contracts: {},
    account: "0x0",

    init: function () {
        return App.initWeb3();
    },

    initWeb3: function () {
        // Modern dApp browsers
        if (typeof window.ethereum !== "undefined") {
            App.web3Provider = window.ethereum;
            try {
                // Request account access
                window.ethereum.request({ method: "eth_requestAccounts" });
                web3 = new Web3(window.ethereum);
            } catch (error) {
                console.error("User denied account access");
            }
        }
        // Legacy dApp browsers
        else if (typeof web3 !== "undefined") {
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
        }
        // Fallback to local provider
        else {
            App.web3Provider = new Web3.providers.HttpProvider(
                "http://localhost:7545"
            );
            web3 = new Web3(App.web3Provider);
        }

        return App.initContract();
    },

    initContract: function () {
        $.getJSON("Election.json", function (election) {
            // Create a truffle contract
            App.contracts.Election = TruffleContract(election);
            App.contracts.Election.setProvider(App.web3Provider);

            App.listenForEvents();
            return App.render();
        });
    },

    render: function () {
        let electionInstance;
        let loader = $("#loader");
        let content = $("#content");

        loader.show();
        content.hide();

        // Load account data
        web3.eth.getAccounts((err, accounts) => {
            if (err === null && accounts.length > 0) {
                App.account = accounts[0];
                $("#accountAddress").html(`Your Account: ${App.account}`);
            }
        });

        App.contracts.Election.deployed()
            .then((instance) => {
                electionInstance = instance;
                return electionInstance.candidatesCount();
            })
            .then(async (candidatesCount) => {
                let candidatesResult = $("#candidatesResults");
                candidatesResult.empty();

                let candidateSelect = $("#candidateSelect");
                candidateSelect.empty();

                let candidatePromises = [];

                // Collect promises for candidate retrieval
                for (let i = 1; i <= candidatesCount; i++) {
                    candidatePromises.push(
                        electionInstance.candidates(i).then((candidate) => {
                            let id = candidate[0];
                            let name = candidate[1];
                            let voteCount = candidate[2];

                            // Render Candidate Result
                            let candidateTemplate = `
                              <tr>
                                  <th>${id}</th>
                                  <td>${name}</td>
                                  <td>${voteCount}</td>
                              </tr>
                          `;
                            candidatesResult.append(candidateTemplate);

                            let candidateOptions = `
                                <option value=${id}>${name}</option>
                            `;
                            candidateSelect.append(candidateOptions);
                        })
                    );
                }

                // Wait for all candidate retrievals to complete
                
                return await electionInstance.voters(App.account);
            })
            .then((hasVoted) => {
                if (hasVoted) $("form").hide();
            })
            .then(() => {
                loader.hide();
                content.show();
            })
            .catch((error) => {
                console.error("Error in rendering:", error);
            });
    },

    // Method to cast a vote (to be implemented)
    castVote: function () {
        let candidateId = $("#candidateSelect").val();
        console.log(candidateId)
        App.contracts.Election.deployed()
            .then((instance) => {
                return instance.vote(candidateId, { from: App.account });
            })
            .then((result) => {
                // Refresh the page after voting
                App.render();
            })
            .catch((err) => {
                console.error(err);
            });
    },

    listenForEvents: function(){
        App.contracts.Election.deployed().then(function(instance){
            instance.voteEvent({}, {
                formBlock:0,
                toBlock: 'lastest'
            }).watch(function(error, event){
                console.log("An event as triggered", event);

                App.render();
            })
        })
    }
};


$(function () {
    $(window).on("load", function () {
        App.init();
    });
});
