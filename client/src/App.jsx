import React, { useState, useEffect } from 'react';
import SimpleStorageContract from './contracts/SimpleStorage.json';
import getWeb3 from './getWeb3';

import './App.css';
const { create } = require('ipfs-http-client');
const ipfs = create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https', apiPath: '/api/v0' });

const App = () => {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [buffer, setBuffer] = useState(null);
  const [hash, setHash] = useState('empty');
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    initial();
  }, [disabled]);

  const initial = async () => {
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SimpleStorageContract.networks[networkId];
      const instance = new web3.eth.Contract(SimpleStorageContract.abi, deployedNetwork && deployedNetwork.address);
      setContract(instance);
      const response = await instance.methods.get().call();
      setHash(response);
    } catch (error) {
      alert(`Failed to load web3, accounts, or contract. Check console for details.`);
      console.error(error);
    }
  };

  const captureFile = (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      setBuffer(Buffer(reader.result));
    };
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setDisabled(true);
    const file = await ipfs.add(buffer);
    await contract.methods.set(file.path).send({ from: account });
    const response = await contract.methods.get().call();
    setHash(response);
    setDisabled(false);
  };

  return (
    <>
      <nav className='navbar navbar-expand-lg navbar-dark bg-primary'>
        <div className='container-fluid'>
          <a className='navbar-brand' href='/'>
            IPFS File Upload
          </a>
        </div>
      </nav>
      <div className='App mt-5'>
        <form onSubmit={onSubmit}>
          <input type='file' onChange={captureFile} />
          <input type='submit' className='btn btn-primary' disabled={disabled} />
        </form>
      </div>
      <div className='container'>
        <table className='table table-hover mt-5'>
          <thead>
            <tr>
              <th scope='col'>IPFS Hash</th>
              <th scope='col'>Image</th>
            </tr>
          </thead>
          <tbody>
            <tr className='table-success'>
              <th scope='row'>{hash}</th>
              <td>
                {/* <a href={`https://ipfs.io/ipfs/${hash}`} target='__blank'>
                  Link
                </a> */}
                <button type='button' className='btn btn-primary' data-bs-toggle='modal' data-bs-target='#exampleModal'>
                  View Image
                </button>
                <div className='modal fade' id='exampleModal' tabIndex='-1' aria-labelledby='exampleModalLabel' aria-hidden='true'>
                  <div className='modal-dialog modal-xl'>
                    <div className='modal-content'>
                      <div className='modal-header'>
                        <h5 className='modal-title' id='exampleModalLabel'>
                          Image
                        </h5>
                        <button type='button' className='btn-close' data-bs-dismiss='modal' aria-label='Close'></button>
                      </div>
                      <div className='modal-body'>
                        <img className="center" src={`https://ipfs.io/ipfs/${hash}`} alt='alternate' width="1100px"></img>
                      </div>
                      <div className='modal-footer'>
                        <button type='button' className='btn btn-secondary' data-bs-dismiss='modal'>
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default App;
