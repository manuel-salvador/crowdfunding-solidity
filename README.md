Solidity smart contract practice - Crowdfunding

In progress

---

## Challenges:

- [x] #1 Create a contract with states and functions
  - [x] FundProject function
  - [x] ChangeProjectState function
- [x] #2 Use the modifier function to allow only the owner to change the state
- [x] #3 Add events to fundProject and changeProjectState functions
- [x] #4 Add validations
  - [x] Can't fund project if state is closed/0 - my change, can't fund project if state is no active because there are other states like paused(2)
  - [x] Can't change state with same value
  - [x] Can't fund project with 0 ETH
- [x] #5 Structs: save all info un a Struct, update functions to use created Struct
- [x] #6 Enums: add enums to avoid to create new states
- [x] #7 Arrays y Mapping:
  - [x] Allows projects to be stored in an array
  - [x] Create the "createProject" function where the project data can be initialized
  - [x] Create a mapping that stores contributions to projects

---

Planned:

- dueDate on projects.
- withdrawFunds function: This feature would allow the project owner to withdraw the funds raised once the funding goal has been reached.
- refundInvestors function: This feature will allow investors to withdraw their funds if the project does not reach its funding target.
