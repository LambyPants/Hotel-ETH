//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.7;
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
contract LambysBNB {
    // to prevent overflows, use SafeMath
    using SafeMath for uint256;
    using SafeMath for uint64;
    // 1 token = 1 day accomodation
    BookingToken private bookingToken;
    // used for time conversions
    DateTime private dateTime;
    // the owner can access all functions
    address public owner;
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
        address customerAddress;
    }
    // this contract uses epoch/unix time to determine booking days; keys must be mod 86400
    mapping(uint256 => Appointment) scheduleByTimestamp;
    // list of all timestamps for a given user; key is user address
    // set an array length if you are worried about variable gas consumption
    mapping(address => uint256[]) userBookings;
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
        require(_d > 0 && _d < 32, "invalid day");
        _;
    }
    // timestamp cannot be before CONTRACT_DEPLOY_TIME && must be mod 0
    // this is because we use unix days as our mapping keys
    modifier validTimestamp(uint256 _t) {
        validateTimestamp(_t);
        _;
    }

    // name can't be empty
    modifier validName(string memory _s) {
        require(bytes(_s).length != 0, "Party name cannot be blank");
        _;
    }

    constructor(uint64 _initialPrice) {
        CONTRACT_DEPLOY_TIME = block.timestamp;
        bookingToken = new BookingToken(address(this));
        owner = msg.sender;
        // Rinkeby ETH/USD
        priceFeed = AggregatorV3Interface(
            0x8A753747A1Fa494EC906cE90E9f37563A8AF630e
        );
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

    /// @notice Returns an array of bool values for each day within a given month; false is unbooked, true is booked
    /// @dev Notice: February can have 28 days; other months return 30 || 31 items
    /// @return bool[]
    function getMonthlyAvailability(uint8 _month, uint16 _year)
        public
        view
        returns (bool[] memory)
    {
        uint8 i = 0;
        uint8 daysInMonth = calculateDaysInMonth(_month, _year);
        // get the timestamp for the 1st of the month
        uint256 _timestamp = dateTime.toTimestamp(_year, _month, 1);
        // this prevents invalid years passed to the contract
        validateTimestamp(_timestamp);
        // up to 31 days in a month
        bool[] memory monthlyAppointments = new bool[](daysInMonth);
        for (i; i < calculateDaysInMonth(_month, _year); i++) {
            if (scheduleByTimestamp[_timestamp + (i * 86400)].isAppointment) {
                monthlyAppointments[i] = true;
            }
        }
        // returns an array with the correct number of days
        return monthlyAppointments;
    }

    /// @notice Returns number of days in a month
    /// @dev month must > 0 < 13 note that the dateTime library has a similar function but I already wrote this and like this one slightly more since it has requires
    /// @return uint8 of 28, 30, or 31
    function calculateDaysInMonth(uint8 _m, uint16 _y)
        internal
        view
        validMonth(_m)
        returns (uint8)
    {
        require(_m > 0 && _m < 13, "Must be 1 - 12 value");
        // February, April, June, September, November have 30 days
        if (_m == 2 || _m == 4 || _m == 6 || _m == 9 || _m == 11) {
            return 31;
        } else if (_m == 2) {
            // February can be a leap year which is annoying
            return dateTime.isLeapYear(_y) ? 29 : 28;
        } else {
            // January, March, May, July, August, October, and December have 31 days
            return 30;
        }
    }

    /// @notice Allows user to schedule an appointment per the year -> month -> day datamodel
    /// @dev validMonth validName validDay required
    function bookAppointment(
        string memory _name,
        uint256 _timestamp,
        uint8 _numDays
    ) public validName(_name) validTimestamp(_timestamp) {
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
            // save all user timestamps in array
            userBookings[msg.sender].push(_timestamp);
        }

        emit AppointmentScheduled(msg.sender, _timestamp, _numDays);
    }

    /// @notice Allows the current owner role to be passed to a new owner
    /// @dev owner controls pretty much everything so pass with care
    function passOwnerRole(address _owner) public onlyOwner {
        owner = _owner;
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
        try priceFeed.latestRoundData() returns (
            uint80 roundID,
            int256 price,
            uint256 startedAt,
            uint256 timeStamp,
            uint80 answeredInRound
        ) {
            console.log(roundID, startedAt, timeStamp, answeredInRound);
            return price;
        } catch Error(string memory _err) {
            console.log(_err);
            // not for production; suggest you revert, call propietary fallback oracle, fetch from another 3rd-party oracle, etc.
            // in our case lets just return 100 USD
            return 100 * 1e8; // ETH won't fall under $100, right? ....right?
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
        bookingToken.mint(msg.sender, _numTokens);
        // use bookingTokenPrice for easy human-readable USD value
        emit TokenBought(msg.sender, _numTokens, bookingTokenPrice);
    }
}
