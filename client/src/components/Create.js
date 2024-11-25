import { useState } from 'react';
import { ethers } from 'ethers';
import { Row, Form, Button } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import '../styles/styles.css';
const Create = ({ mergedContract }) => {
  const [video, setVideo] = useState('');
  const [price, setPrice] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const PINATA_API_KEY = "20a1ac93e10b67f081c5";
  const PINATA_SECRET_API_KEY = "2b3680b650e07a507c4df5a9649b9b6438d7f8e4c3cc0cfab22a73bb968d02d7";


  const uploadToPinata = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_API_KEY,
        },
      });
      setVideo(`https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`);
      toast.success('Video uploaded successfully!');
    } catch (err) {
      console.error("Pinata upload error:", err);
      toast.error('Video upload failed.');
    }
  };

  const createNFT = async () => {
    if (!video || !price || !name || !description) {
      toast.error('All fields are required!');
      return;
    }

    if (isNaN(price) || Number(price) <= 0) {
      toast.error('Invalid price! Enter a number greater than 0.');
      return;
    }

    try {
      const metadata = { video, name, description };
      const res = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', metadata, {
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_API_KEY,
        },
      });

      const metadataUri = `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
      const tx = await mergedContract.mint(metadataUri, ethers.utils.parseEther(price));
      const receipt = await tx.wait();
      const tokenId = receipt.events[0].args.tokenId.toNumber();
      toast.success(`NFT minted and listed! Token ID: ${tokenId}`);
    } catch (err) {
      console.error("NFT creation error:", err);
      toast.error('NFT creation failed.');
    }
  };

  return (
    <div className="container mt-5">
      <Row className="g-4">
        <Form.Control type="file" accept="video/*" onChange={uploadToPinata} />
        <Form.Control onChange={(e) => setName(e.target.value)} size="lg" type="text" placeholder="Name" />
        <Form.Control onChange={(e) => setDescription(e.target.value)} size="lg" as="textarea" placeholder="Description" />
        <Form.Control onChange={(e) => setPrice(e.target.value)} size="lg" type="number" placeholder="Price in USDe" />
        <Button onClick={createNFT} variant="primary" size="lg">Create & List NFT!</Button>
      </Row>
      <ToastContainer />
    </div>
  );
};

export default Create;



