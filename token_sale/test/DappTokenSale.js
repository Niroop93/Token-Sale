var DappTokenSale = artifacts.require("./DappTokenSale.sol");
var DappToken = artifacts.require("./DappToken.sol");

contract('DappTokenSale', function(accounts){
	var tokenInstance;
	var tokenSaleInstance;
	var tokenPrice = 1000000000000000; // wei
	var buyer = accounts[1];
	var admin = accounts[0];
	var tokensAvailable = 750000;
	var numberOfTokens;

	it('initializes the contract with correct values', function(){
		return DappTokenSale.deployed().then(function(instance){
			tokenSaleInstance = instance;
			return tokenSaleInstance.address;
		}).then(function(address){
			assert.notEqual(address, 0x0, 'has contract address');
			return tokenSaleInstance.tokenContract();
		}).then(function(address){
			assert.notEqual(address, 0x0, 'has tokenContract address');
			return tokenSaleInstance.tokenPrice();
		}).then(function(price){
			assert.equal(price, tokenPrice, 'token price is correct');
		});
	});

	it('facilitates token buying', function(){
		return DappToken.deployed().then(function(instance){
			tokenInstance = instance;
			return DappTokenSale.deployed();
		}).then(function(instance){
			tokenSaleInstance = instance;
			tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, {from: admin});
		}).then(function(receipt){
			numberOfTokens = 10;
			return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: numberOfTokens * tokenPrice});
		}).then(function(receipt){
			assert.equal(receipt.logs.length, 1, 'triggers an event');
			assert.equal(receipt.logs[0].event, 'Sell', 'Should be the Sell event');
			assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account which purchased the tokens');
			assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'logs the to tokens purchased');
			return tokenSaleInstance.tokensSold();
		}).then(function(amount){
			assert.equal(amount.toNumber(), numberOfTokens, 'increments the number of tokens sold');
			return tokenInstance.balanceOf(buyer);
		}).then(function(amount){
			assert.equal(amount.toNumber(), numberOfTokens);
			return tokenInstance.balanceOf(tokenSaleInstance.address);
		}).then(function(balance){
			assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens);
			return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: 1});
		}).then(assert.fail).catch(function(error){
			assert(error.message.indexOf('revert') >= 0, 'msg.value must be equal to num of tokens in wei');
			return tokenSaleInstance.buyTokens(800000, {from: buyer, value: numberOfTokens * tokenPrice});
		}).then(assert.fail).catch(function(error){
			assert(error.message.indexOf('revert') >= 0, 'cannot purchase more token than available');
		});
	});

	it('ends token sale', function(){
		return DappToken.deployed().then(function(instance){
			tokenInstance = instance;
			return DappTokenSale.deployed();
		}).then(function(instance){
			tokenSaleInstance = instance;
			return tokenSaleInstance.endSale({from: buyer});
		}).then(assert.fail).catch(function(error){
			assert(error.message.indexOf('revert') >= 0,'must be an admin to end sale');
			return  tokenSaleInstance.endSale({from: admin});
		}).then(function(receipt){
			return tokenInstance.balanceOf(admin);
		}).then(function(balance){
			assert.equal(balance.toNumber(), 999990, 'returns unsold dapptokens to admin');
			return tokenSaleInstance.tokenPrice();
		}).then(function(price){
			assert.equal(price.toNumber(), 0 , ' should reset the price');
		});
	});
});