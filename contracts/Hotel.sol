//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "ethereum-datetime/contracts/DateTime.sol";
import "./DateTime.sol";
// our BookingToken
import "./Token.sol";

/// @title A traditional, fixed-price business (Bed and Breakfast) run on Ethereum. Includes a token + schedule system.
/// @author Ryan "Lamby" Lambert
/// @notice 1 token is always = 1 day accomodation. The USD price of the token can change. Appointments are scheduled in epoch time.
/// @dev Example project to be used on Rinkeby test network
contract Hotel {
    // to prevent overflows, use SafeMath
    using SafeMath for uint256;
    using SafeMath for uint64;
    // 1 token = 1 day accomodation
    BookingToken public bookingToken;
    // used for time conversions
    DateTime private dateTime;
    // used to return a static price
    bool private useFixedPricing;
    // the owner can access all functions
    address payable public owner;
    // price of a token in USD
    uint64 public bookingTokenPrice;
    // minimum year someone can schedule an appointment
    uint256 CONTRACT_DEPLOY_TIME;
    // used to determine amount of ETH to send in transaction
    AggregatorV3Interface internal priceFeed;
    // primary appointment storage
    struct Appointment {
        bool isAppointment;
        string partyName;
        address userAddress;
    }
    // user appointment info - saved in userBookings array
    struct UserBooking {
        uint256 timestamp;
        uint256 numDays;
    }
    // this contract uses epoch/unix time to determine booking days; keys must be mod 86400
    mapping(uint256 => Appointment) scheduleByTimestamp;
    // list of all timestamps for a given user; key is user address
    // set an array length if you are worried about variable gas consumption
    mapping(address => UserBooking[]) public userBookings;
    // emitted when user changes
    event OwnerChanged(address indexed from, address to);
    // emitted when price of the token changes
    event TokenPriceChanged(uint64 oldPrice, uint64 newPrice);
    // emitted when user buys a token
    event TokenBought(address indexed from, uint256 sum, uint64 price);
    // emitted when user schedules an appointment
    event AppointmentScheduled(
        address indexed from,
        uint256 timestamp,
        uint256 sum
    );
    // restricts access to owner role
    modifier onlyOwner() {
        require(msg.sender == owner, "owner restricted funtionality");
        _;
    }
    // month is > 0 < 13, year is above contract deploy date
    modifier validMonth(uint8 _m) {
        require(_m > 0 && _m < 13, "Month must be 1 - 12 value");
        _;
    }
    // day is a valid 1 - 31 number value
    modifier validDay(uint8 _d) {
        require(_d > 0 && _d < 32, "Invalid day");
        _;
    }
    // numDays > 0
    modifier validNumDays(uint8 _num) {
        require(_num > 0, "Must be a value above 0");
        _;
    }
    // timestamp cannot be before CONTRACT_DEPLOY_TIME && must be mod 0
    // this is because we use unix days as our mapping keys
    modifier validTimestamp(uint256 _t) {
        validateTimestamp(_t);
        _;
    }

    // valid read range - can't request more than 365 days at a time and timestamp must be mod 86400
    modifier validRange(uint256 _t, uint8 _r) {
        isMod86400(_t);
        require(_r <= 365 && _r > 0, "Valid ranges are 1 - 365");
        _;
    }

    // name can't be empty
    modifier validName(string memory _s) {
        require(bytes(_s).length != 0, "Party name cannot be blank");
        _;
    }

    constructor(
        uint64 _initialPrice,
        address _priceContractAddr,
        bool _useFixedPricing
    ) {
        useFixedPricing = _useFixedPricing;
        CONTRACT_DEPLOY_TIME = block.timestamp;
        bookingToken = new BookingToken(address(this));
        owner = payable(msg.sender);
        // Rinkeby ETH/USD
        priceFeed = AggregatorV3Interface(_priceContractAddr);
        // DateTime Helper Contract
        dateTime = new DateTime();
        bookingTokenPrice = _initialPrice;
    }

    // timestamp cannot be before CONTRACT_DEPLOY_TIME && must be mod 0
    // this is because we use unix days as our mapping keys
    function validateTimestamp(uint256 _t) private view {
        require(
            _t > CONTRACT_DEPLOY_TIME,
            "Cannot use any timestamp before the contract deploy timestamp"
        );
        isMod86400(_t);
    }

    function isMod86400(uint256 _t) private pure {
        require(
            _t.mod(86400) == 0,
            "Timestamp must be mod 86400; try using getUnixTimestamp for a given month, day, year"
        );
    }

    /// @notice Helper to get a unix timestamp given month, day, year.
    /// @dev Can be calculated on the front-end but here's a shortcut :]
    /// @return uint256
    function getUnixTimestamp(
        uint8 _month,
        uint8 _day,
        uint16 _year
    ) public view returns (uint256) {
        return dateTime.toTimestamp(_year, _month, _day);
    }

    /// @notice Shortcut to return balanceOf a given address from our token contract
    /// @dev you can just call the bookingToken function directly once you know the address; I set it to private and just included this function since its all thats relevant to our example
    /// @return uint256
    function getTokenBalance(address _address) public view returns (uint256) {
        return bookingToken.balanceOf(_address);
    }

    /// @notice Helper to return all bookings for a given address
    /// @dev userBookings is a dynamic array, so this function is meant to be read-only and should not be used in any state-altering functionality
    /// @return Array[]
    function getAppointmentsByUser(address _addr)
        public
        view
        returns (UserBooking[] memory)
    {
        return userBookings[_addr];
    }

    /// @notice Returns an array of eventIDs for a given range
    /// @return eventID[uint256]
    function getRangeAvailability(uint256 _start, uint8 _numDays)
        public
        view
        validRange(_start, _numDays)
        returns (address[] memory)
    {
        uint8 i = 0;
        // up to 31 days in a month
        address[] memory monthlyAppointments = new address[](_numDays);
        for (i; i < _numDays; i++) {
            Appointment memory foundAppointment = scheduleByTimestamp[
                _start + (i * 86400)
            ];
            if (foundAppointment.isAppointment) {
                monthlyAppointments[i] = foundAppointment.userAddress;
            }
        }
        // returns an array with the correct number of days
        return monthlyAppointments;
    }

    /// @notice Allows user to schedule an appointment per the year -> month -> day datamodel
    /// @dev validMonth validName validDay required
    function bookAppointment(
        string memory _name,
        uint256 _timestamp,
        uint8 _numDays
    )
        public
        validName(_name)
        validTimestamp(_timestamp)
        validNumDays(_numDays)
    {
        // the goal is to have at least 24 hours notice before a booking
        // uint256 _timeDelta = _timestamp.sub(block.timestamp);
        // require(_timeDelta >= 86400, "booking date too close to todays date");
        // erc20 token already contains a check to ensure user has enough tokens
        bookingToken.burn(msg.sender, _numDays);
        uint8 i = 0;

        for (i; i < _numDays; i++) {
            // Solidity reverts state changes when require is violated
            // this allows us to loop through and create the necessary stateChanges in 1 for loop
            require(
                scheduleByTimestamp[_timestamp + (86400 * i)].isAppointment !=
                    true,
                "Appointment already exists on one or more of the requested dates"
            );
            // save each booking day indexed by timestamp; this makes it easy to look up a range of days by unix uint256 mod 86400
            scheduleByTimestamp[_timestamp + (86400 * i)] = Appointment(
                true,
                _name,
                msg.sender
            );
            // save all user timestamps in array - we can use the timestamp + numDays as keys to our primary Appointment mapping
            userBookings[msg.sender].push(UserBooking(_timestamp, _numDays));
        }
        emit AppointmentScheduled(msg.sender, _timestamp, _numDays);
    }

    /// @notice Allows the current owner role to be passed to a new owner
    /// @dev owner controls pretty much everything so pass with care
    function passOwnerRole(address _owner) public onlyOwner {
        owner = payable(_owner);
        emit OwnerChanged(msg.sender, _owner);
    }

    /// @notice Allows owner to set a new price for 1 token
    /// @dev uint64 is 18,446,744,073,709,551,615 which seems like an expensive stay at our BNB
    function changeTokenPrice(uint64 _newPrice) public onlyOwner {
        require(_newPrice > 0, "New price must be more than zero");
        // emit an event w/ new and old values
        emit TokenPriceChanged(bookingTokenPrice, _newPrice);
        //check if msg.sender have minter role
        bookingTokenPrice = _newPrice;
    }

    /// @notice Returns the price of ETH / USD from Chainlink Rinkeby price feed
    /// @dev Chainlink returns int256 values which can be negative
    /// @return int256
    function returnPrice() internal view returns (int256) {
        // not for production; suggest you revert, call propietary fallback oracle, fetch from another 3rd-party oracle, etc.
        // in our case lets just return 100 USD
        // ETH won't fall under $100, right? ....right?
        int256 fallbackValue = 100 * 1e8;
        if (useFixedPricing) {
            return fallbackValue;
        }
        try priceFeed.latestRoundData() returns (
            uint80,
            int256 price,
            uint256,
            uint256,
            uint80
        ) {
            return price;
        } catch Error(string memory _err) {
            console.log(_err);
            return fallbackValue;
        }
    }

    /// @notice Returns the price of X tokens
    /// @dev Chainlink returns int256 values which can be negative; converted to uint in this function
    /// @return uint256
    function getEthPriceForTokens(uint256 _numTokens)
        public
        view
        returns (uint256)
    {
        require(_numTokens > 0, "invalid number of tokens");
        // get the raw int256 price
        int256 _rawEthToUsdPrice = returnPrice();
        // protect against overflows from the priceFeed since int can be negative
        require(_rawEthToUsdPrice >= 0, "price for Ether cannot be negative");
        // convert it to uint so we can compare to msg.value
        uint256 _ethToUsdPrice = uint256(_rawEthToUsdPrice);
        // USDC needs 8 decimals added
        uint256 _normalizedPrice = _ethToUsdPrice.div(1e8);
        // get the price for 1 token
        uint256 _priceFor1Token = bookingTokenPrice.div(_normalizedPrice);
        // and then multiply that price by _numTokens and then by 1e18 which converts eth to wei
        return (_priceFor1Token.mul(_numTokens)).mul(1e18);
    }

    /// @notice Allows user to buy a X tokens
    /// @dev msg.value must be >= the getEthPriceForTokens value
    function buyTokens(uint256 _numTokens) public payable {
        require(msg.value > 0, "must send ether in request");
        uint256 _etherPrice = getEthPriceForTokens(_numTokens);
        require(msg.value >= _etherPrice, "not enough ether sent in request");
        // transfers ETH to owner account
        (bool sent, ) = owner.call{value: msg.value}("");
        require(sent, "Failed to send Ether");
        bookingToken.mint(msg.sender, _numTokens);
        // use bookingTokenPrice for easy human-readable USD value
        emit TokenBought(msg.sender, _numTokens, bookingTokenPrice);
    }
}
