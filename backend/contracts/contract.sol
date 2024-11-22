pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";


contract VideoNFTMarketplace is ERC721URIStorage {
    uint public tokenCount;
    uint public itemCount;

    struct Item {
        uint itemId;
        uint tokenId;
        uint price;
        address payable seller;
        bool sold;

    }
   event Offered(
        uint itemId,
        uint tokenId,
        uint price,
        address indexed seller
    );

    event Purchased(uint itemId,uint tokenId,uint price,address indexed buyer);


    event VideoNFTListed(uint256 tokenId,uint256 price);


    mapping(uint => Item) public items;
    mapping(uint => uint) public listedItems;
    mapping(uint => mapping(address => bool)) public hasAccessToVideo;

    constructor() ERC721("VideoNFT","VNT") {}


    function mint(string memory _tokenURI,uint _price) external returns(uint) {
        tokenCount++;
        itemCount++;

        _safeMint(msg.sender,tokenCount);
        _setTokenURI(tokenCount,_tokenURI);

        items[itemCount] =  Item(
            itemCount,
            tokenCount,
            _price,
            payable(msg.sender),
            false        
        );

        emit Offered(itemCount,tokenCount,_price,msg.sender);

        listVideoNFT(tokenCount,_price);
        return tokenCount;
    
    }

    function listVideoNFT(uint256 tokenId,uint256 price) public {
        require(ownerOf(tokenId) == msg.sender,"you need to own this nft");
        require(price > 0,"price must me greater than 0");

        listedItems[tokenId] = price;
        emit VideoNFTListed(tokenId, price);
    }   


    function purchase(uint _itemId) external payable {
        uint _totalPrice = getTotalPrice(_itemId);
        Item storage item = items[_itemId];
        require(_itemId >0 && _itemId <= itemCount,"Item doesnt exits");
        require(msg.value>= _totalPrice,"not enough ether");
        require(msg.sender != item.seller,"seller cant buy");

        item.seller.transfer(item.price);
        item.sold = true;
        hasAccessToVideo[item.tokenId][msg.sender] = true;

        emit Purchased(_itemId, tokenId, price, buyer);

    }


    function getTotalPrice(uint _itemId) view public returns(uint) {
        return (items[_itemId].price * (1003)) / 100;
    }


    function hasPurched(uint256 tokenId,address user) external view returns(bool) {
        return hasAccessToVideo[tokenId][user];
        
    }
}