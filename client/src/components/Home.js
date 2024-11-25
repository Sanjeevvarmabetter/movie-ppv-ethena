import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Row, Col, Button, Spinner, Alert } from "react-bootstrap";

const Marketplace = ({ mergedContract }) => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [access, setAccess] = useState({}); 

  // Load items from the marketplace
  const loadItems = async () => {
    try {
      setLoading(true);
      const itemCount = await mergedContract.itemCount();
      const loadedItems = [];

      for (let i = 1; i <= itemCount; i++) {
        const item = await mergedContract.items(i);
        const tokenURI = await mergedContract.tokenURI(item.tokenId);
        const metadata = await (await fetch(tokenURI)).json();

        // Check if the current user has purchased this token
        const hasAccess = await mergedContract.hasPurchased(
          item.tokenId,
          window.ethereum.selectedAddress
        );

        loadedItems.push({
          itemId: item.itemId.toString(),
          tokenId: item.tokenId.toString(),
          price: ethers.utils.formatEther(item.price),
          seller: item.seller,
          name: metadata.name,
          description: metadata.description,
          video: metadata.video,
          sold: item.sold, // Still track if sold for other purposes
        });

        setAccess((prev) => ({ ...prev, [item.tokenId]: hasAccess }));
      }

      setItems(loadedItems);
    } catch (err) {
      console.error("Error loading items:", err);
      setError("Unable to load marketplace items. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Purchase an item
  const buyItem = async (item) => {
    try {
      setPurchasing(true);
      setError(null);
      const totalPrice = await mergedContract.getTotalPrice(item.itemId);
      const tx = await mergedContract.purchaseItem(item.itemId, { value: totalPrice });
      await tx.wait();

      
      setAccess((prev) => ({ ...prev, [item.tokenId]: true }));
    } catch (err) {
      console.error("Purchase error:", err);
      setError("seller cant buy, listed nft.");
    } finally {
      setPurchasing(false);
    }
  };

  // Restrict video playback unless purchased
  const handleVideoPlay = (e, tokenId) => {
    if (!access[tokenId]) {
      e.preventDefault();
      alert("Purchase required to view this video.");
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="container mt-5">
      <Row xs={1} md={2} lg={3} className="g-4">
        {items.map((item) => (
          <Col key={item.itemId}>
            <div className="card">
              <div style={{ position: "relative", width: "100%", height: "200px" }}>
                <video
                  src={item.video}
                  controls={access[item.tokenId]} // Enable controls only if access is granted
                  style={{ width: "100%", height: "100%" }}
                  preload="metadata"
                  onPlay={(e) => handleVideoPlay(e, item.tokenId)}
                />
                {!access[item.tokenId] && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      backgroundColor: "rgba(0, 0, 0, 0.6)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "white",
                      fontSize: "18px",
                    }}
                  >
                    Locked: Pay to Unlock
                  </div>
                )}
              </div>
              <div className="card-body">
                <h5>{item.name}</h5>
                <p>{item.description}</p>
                <p>Price: {item.price} USDe</p>
                <Button
                  onClick={() => buyItem(item)}
                  disabled={purchasing || access[item.tokenId]}
                >
                  {purchasing && !access[item.tokenId]
                    ? "Processing..."
                    : access[item.tokenId]
                    ? "Access Granted"
                    : "Buy Video"}
                </Button>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Marketplace;
