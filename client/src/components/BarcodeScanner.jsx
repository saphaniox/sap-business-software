import { useState, useEffect, useRef } from 'react';
import { Modal, Button, Select, message, Space, Alert, Typography } from 'antd';
import { CameraOutlined, BarcodeOutlined, StopOutlined } from '@ant-design/icons';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

const { Text } = Typography;

const BarcodeScanner = ({ visible, onClose, onScan, mode = 'barcode' }) => {
  const [scanning, setScanning] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [lastScanned, setLastScanned] = useState(null);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    if (visible) {
      initializeCameras();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [visible]);

  const initializeCameras = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        setCameras(devices);
        // Prefer back camera on mobile
        const backCamera = devices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear')
        );
        setSelectedCamera(backCamera?.id || devices[0].id);
      } else {
        message.error('No cameras found on this device');
      }
    } catch (error) {
      console.error('Error getting cameras:', error);
      message.error('Failed to access camera. Please check permissions.');
    }
  };

  const startScanning = async () => {
    if (!selectedCamera) {
      message.error('Please select a camera');
      return;
    }

    try {
      // Clean up any existing scanner first
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
          await html5QrCodeRef.current.clear();
        } catch (e) {
          console.log('Cleanup error:', e);
        }
      }

      html5QrCodeRef.current = new Html5Qrcode('barcode-scanner-container');
      
      const config = {
        fps: 10,
        qrbox: mode === 'qr' ? { width: 250, height: 250 } : { width: 300, height: 150 },
        aspectRatio: mode === 'qr' ? 1.0 : 2.0,
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E
        ]
      };

      await html5QrCodeRef.current.start(
        selectedCamera,
        config,
        (decodedText, decodedResult) => {
          // Prevent duplicate scans
          if (decodedText !== lastScanned) {
            setLastScanned(decodedText);
            message.success(`Scanned: ${decodedText}`);
            onScan(decodedText);
            
            // Auto-close after successful scan
            setTimeout(() => {
              stopScanning();
              onClose();
            }, 500);
          }
        },
        (errorMessage) => {
          // Scanning errors are normal, don't show them
          // console.log('Scanning...', errorMessage);
        }
      );

      setScanning(true);
      message.info('Camera started. Position barcode in view.');
    } catch (error) {
      console.error('Error starting scanner:', error);
      message.error(`Failed to start camera: ${error.message || 'Please check camera permissions and try again.'}`);
      setScanning(false);
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (scanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
      setScanning(false);
    }
  };

  const handleCameraChange = (cameraId) => {
    setSelectedCamera(cameraId);
    if (scanning) {
      stopScanning().then(() => {
        // Small delay before restarting with new camera
        setTimeout(() => {
          setSelectedCamera(cameraId);
        }, 100);
      });
    }
  };

  return (
    <Modal
      title={
        <Space>
          <BarcodeOutlined />
          <span>{mode === 'qr' ? 'QR Code' : 'Barcode'} Scanner</span>
        </Space>
      }
      open={visible}
      onCancel={() => {
        stopScanning();
        onClose();
      }}
      width={600}
      footer={[
        <Button key="close" onClick={() => {
          stopScanning();
          onClose();
        }}>
          Close
        </Button>,
        scanning ? (
          <Button
            key="stop"
            danger
            icon={<StopOutlined />}
            onClick={stopScanning}
          >
            Stop Scanning
          </Button>
        ) : (
          <Button
            key="start"
            type="primary"
            icon={<CameraOutlined />}
            onClick={startScanning}
            disabled={!selectedCamera}
          >
            Start Scanning
          </Button>
        )
      ]}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {cameras.length > 0 && (
          <div>
            <Text strong>Select Camera:</Text>
            <Select
              value={selectedCamera}
              onChange={handleCameraChange}
              style={{ width: '100%', marginTop: 8 }}
              disabled={scanning}
            >
              {cameras.map((camera) => (
                <Select.Option key={camera.id} value={camera.id}>
                  {camera.label || `Camera ${camera.id}`}
                </Select.Option>
              ))}
            </Select>
          </div>
        )}

        <Alert
          message={
            mode === 'qr'
              ? 'Position the QR code within the frame to scan'
              : 'Position the barcode within the frame to scan'
          }
          type="info"
          showIcon
        />

        <div
          id="barcode-scanner-container"
          style={{
            width: '100%',
            minHeight: scanning ? '400px' : '200px',
            border: '2px dashed #d9d9d9',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fafafa'
          }}
        >
          {!scanning && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <CameraOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
              <div style={{ marginTop: 16, color: '#8c8c8c' }}>
                Click "Start Scanning" to begin
              </div>
            </div>
          )}
        </div>

        {lastScanned && (
          <Alert
            message="Last Scanned Code"
            description={lastScanned}
            type="success"
            showIcon
          />
        )}
      </Space>
    </Modal>
  );
};

export default BarcodeScanner;
