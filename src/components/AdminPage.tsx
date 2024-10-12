import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AdminPageProps {
  onClose: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onClose }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sdeFile, setSdeFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const handleAuthentication = () => {
    if (password === 'Password123') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.bz2')) {
      setSdeFile(file);
    } else {
      alert('Please select a valid .bz2 file');
      setSdeFile(null);
    }
  };

  const handleUpload = async () => {
    if (!sdeFile) return;

    const formData = new FormData();
    formData.append('sde', sdeFile);

    try {
      setUploadStatus('Uploading...');
      const response = await fetch('http://localhost:3000/api/upload-sde', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      setUploadStatus('Upload successful! Processing SDE data...');
      
      // Poll for processing status
      const pollStatus = setInterval(async () => {
        const statusResponse = await fetch('http://localhost:3000/api/sde-status');
        const statusData = await statusResponse.json();
        
        if (statusData.status === 'completed') {
          clearInterval(pollStatus);
          setUploadStatus('SDE data processed successfully!');
        } else if (statusData.status === 'failed') {
          clearInterval(pollStatus);
          setUploadStatus('SDE data processing failed. Please try again.');
        }
      }, 5000);

    } catch (error) {
      setUploadStatus('Upload failed. Please try again.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Admin Authentication</h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          className="border p-2 mb-4 w-full"
        />
        <button
          onClick={handleAuthentication}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md relative">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
      >
        <X size={24} />
      </button>
      <h2 className="text-2xl font-bold mb-4">Admin Page</h2>
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Upload SDE File</h3>
        <input
          type="file"
          accept=".bz2"
          onChange={handleFileChange}
          className="mb-2"
        />
        <button
          onClick={handleUpload}
          disabled={!sdeFile}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          Upload SDE
        </button>
      </div>
      {uploadStatus && (
        <div className="mt-4 p-2 bg-gray-100 rounded">
          <p>{uploadStatus}</p>
        </div>
      )}
    </div>
  );
};

export default AdminPage;