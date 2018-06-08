var DappToken = artifacts.require("./DappToken.sol");

contract('DappToken', function(accounts){
	var tokenInstance;

	it('initializes name and symbol', function(){
		return DappToken.deployed().then(function(instance){
			tokenInstance = instance;
			return tokenInstance.name();
		}).then(function(name){
			assert.equal(name, 'DappToken','name is assigned correct');
			return tokenInstance.symbol();
		}).then(function(symbol){
			assert.equal(symbol, 'DAPP', "symbol is assigned correct");
			return tokenInstance.standard();
		}).then(function(standard){
			assert.equal(standard, 'DApp Token V1.0', ' has the correct standard');
		});
	});

	it('sets the total supply upon deployement', function(){
		return DappToken.deployed().then(function(instance){
			tokenInstance = instance;
			return tokenInstance.totalSupply();
		}).then(function(totalSupply){
			assert.equal(totalSupply,1000000, 'sets the total supply to 1 million');
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function(adminBalance){
			assert.equal(adminBalance, 1000000, 'allocates the initial supply to admins account');
		});
	});

	it('transfer ownership', function(){
		return DappToken.deployed().then(function(instance){
			tokenInstance = instance;
			return tokenInstance.transfer.call(accounts[1], 9999999999999999999999999999, {from : accounts[0]} );
		}).then(assert.fail).catch(function(error){
			assert(error.message.indexOf('revert') >= 0, 'error msg must contain revert');
			return tokenInstance.transfer.call(accounts[1], 150000, {from: accounts[0]});
		}).then(function(success){
			assert.equal(success, true, 'must return true');
			return tokenInstance.transfer(accounts[1], 150000, {from: accounts[0]});
		}).then(function(receipt){
			assert.equal(receipt.logs.length, 1, 'triggers an event');
			assert.equal(receipt.logs[0].event, 'Transfer', 'Should be the Transfer event');
			assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the from accounts');
			assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the to account');
			assert.equal(receipt.logs[0].args._value, 150000, 'logs the amount of token transferred');
			return tokenInstance.balanceOf(accounts[1]);
		}).then(function(balance){
			assert.equal(balance.toNumber(), 150000, 'adds amount to the receiving account');
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function(balance){
			assert.equal(balance.toNumber(), 850000, 'deducts the ammount from sender');
		});
	});

	it('approves tokens for deligated transfer', function(){
		return DappToken.deployed().then(function(instance){
			tokenInstance = instance;
			return tokenInstance.approve.call(accounts[1], 100);
		}).then(function(success){
			assert.equal(success, true, 'it returns true');
			return tokenInstance.approve(accounts[1],100);
		}).then(function(receipt){
			assert.equal(receipt.logs.length, 1, 'triggers an event');
			assert.equal(receipt.logs[0].event, 'Approval', 'Should be the Approve event');
			assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the from accounts');
			assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs the to account');
			assert.equal(receipt.logs[0].args._value, 100, 'logs the amount of token transferred');
			return tokenInstance.allowance(accounts[0], accounts[1]);
		}).then(function(allowance){
			assert.equal(allowance.toNumber() , 100, 'stores the allowance');
		});
	});

	it('handels delegate transfers', function(){
		return DappToken.deployed().then(function(instance){
			tokenInstance = instance;
			fromAccount = accounts[2];
			toAccount = accounts[3];
			spendingAccount = accounts[4];
			return tokenInstance.transfer(fromAccount, 100, {from: accounts[0]});
		}).then(function(receipt){
			return tokenInstance.approve(spendingAccount, 10, {from: fromAccount});
		}).then(function(receipt){
			return tokenInstance.transferFrom(fromAccount, toAccount, 9999, {from: spendingAccount});
		}).then(assert.fail).catch(function(error){
			assert(error.message.indexOf('revert') >= 0, 'cannot transfer value more than balance');
			return tokenInstance.transferFrom(fromAccount, toAccount, 11, {from: spendingAccount});
		}).then(assert.fail).catch(function(error){
			assert(error.message.indexOf('revert') >= 0, 'cannot transfer value more than approved');
			return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, {from: spendingAccount});
		}).then(function(success){
			assert(success, true, 'must return true');
			return tokenInstance.transferFrom(fromAccount, toAccount, 10, {from: spendingAccount});
		}).then(function(receipt){
			assert.equal(receipt.logs.length, 1, 'triggers an event');
			assert.equal(receipt.logs[0].event, 'Transfer', 'Should be the Transfer event');
			assert.equal(receipt.logs[0].args._from, fromAccount, 'logs the from accounts');
			assert.equal(receipt.logs[0].args._to, toAccount, 'logs the to account');
			assert.equal(receipt.logs[0].args._value, 10, 'logs the amount of token transferred');
			return tokenInstance.balanceOf(fromAccount);
		}).then(function(balance){
			assert.equal(balance.toNumber(), 90, 'deducts amount from the sending account');
			return tokenInstance.balanceOf(toAccount);
		}).then(function(balance){
			assert.equal(balance.toNumber(), 10, 'adds amount to the receiving account');
			return tokenInstance.allowance(fromAccount, spendingAccount);
		}).then(function(allowance){
			assert.equal(allowance.toNumber(), 0, 'must deduct from allowance');
		})
	});
});