pragma solidity ^0.4.2;

contract DappToken {
	uint256 public totalSupply;
	string  public name = "DappToken";
	string  public symbol = "DAPP";
	string  public standard = 'DApp Token V1.0';
	
	event Transfer(
		address indexed _from,
		address indexed _to,
		uint256 _value
	);

	//approve
	event Approval(
		address indexed _owner,
		address indexed _spender,
		uint256 _value
	);

	mapping(address => uint256) public balanceOf;
	
	//allowance
	mapping(address => mapping(address => uint256)) public allowance;
	//Constructor
	function DappToken(uint256 _initSupply) public {
		balanceOf[msg.sender] = _initSupply;
		//name comes from ERC20 token standard
		totalSupply = _initSupply;
	}

	//Transfer
	function transfer(address _to, uint256 _value) public returns(bool success){
		//exception if not enough balance
		require(balanceOf[msg.sender] >= _value);

		balanceOf[msg.sender] -= _value;
		balanceOf[_to] += _value;

		//trigger event
		Transfer(msg.sender, _to, _value);

		//return a boolean
		return true; 
	}

	//approve
	function approve(address _spender, uint256 _value) public returns(bool success){
		//Approval event
		allowance[msg.sender][_spender] = _value;
		Approval(msg.sender, _spender, _value);
		return true;
	}

	//transfer from
	//Delegated Tranfers
	function transferFrom(address _from, address _to, uint256 _value) public returns(bool success){
		require(_value <= balanceOf[_from]);
		require(_value <= allowance[_from][msg.sender]);

		//change balances
		balanceOf[_from] -= _value;
		balanceOf[_to] += _value;

		allowance[_from][msg.sender] -= _value;
		//transfer event 
		Transfer(_from, _to, _value);
		
		return true;
	}

}