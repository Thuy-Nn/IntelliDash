"use client"
import { useState } from "react"
import { FileUploader } from "react-drag-drop-files"
import { API_ROOT } from '../app/configs.js'
import { useTheme } from '../app/ThemeContext'
import styles from '../styles/UploadFilePanel.module.css'
import IconButton from "./IconButton"
import OpenDashboardsView from "./OpenDashboardsView"
import Panel from "./Panel"


const FILE_TYPES = ["CSV", "XLSX", "XLS"]
const MAX_FILE_SIZE = 10 // in MB


export default function UploadFilePanel({ isOpen, onClose, onDashboardLoad }) {
  const { updateTheme } = useTheme()
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")
  const [uploadResult, setUploadResult] = useState(0)  // 0: no upload yet, 1: success, 2: fail

  const handleChange = (key, value) => {
    updateTheme({ [key]: value })
  }

  const handleFileChange = (file) => {
    setSelectedFile(file)
    setMessage("")
    setUploadResult(0)
  }

  const onSizeError = file => {
    setMessage(`File size exceeds the maximum limit of ${MAX_FILE_SIZE}MB.`)
    if (selectedFile) setSelectedFile(null)
    setUploadResult(2)
  }

  const onTypeError = file => {
    setMessage(`File type not supported. Allowed types: ${FILE_TYPES.join(", ")}`)
    if (selectedFile) setSelectedFile(null)
    setUploadResult(2)
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!selectedFile) {
      setMessage("Please select a file to upload.")
      return
    }
    setUploading(true)
    setMessage("")

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await fetch(`${API_ROOT}/upload`, {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setMessage(`Uploaded: ${selectedFile.name}`)
        setUploadResult(1)
        onClose(data)

      } else {
        const err = await response.json()
        setMessage(`[${response.statusText} ${response.status}] ${err.error || "Upload failed"}`)
        setUploadResult(2)
      }

    } catch (e) {
      setMessage(`Error: ${e.message || "Upload failed"}`)
      setUploadResult(2)
    } finally {
      setUploading(false)
    }
  }

  const renderMessage = () => {
    if (selectedFile && uploadResult === 0) return <>
      <span>Selected file: </span>
      <span className={styles.selectedFile}>{selectedFile.name}</span>
    </>
    if (message) return <span className={uploadResult === 1 ? styles.message__positive : styles.message__negative}>{message}</span>
    return <>
      <span className={styles.message}>Drag & drop a file here, or click to select a file.</span>
      <span className={styles.message}>Supported types: {FILE_TYPES.join(", ")} | Max size: {MAX_FILE_SIZE}MB</span>
    </>
  }

  return (
    <Panel title="Upload Data File" isOpen={isOpen} onClose={onClose}>
      <FileUploader dropMessageStyle={{ backgroundColor: 'rgba(0,0,0,0.99)', fontWeight: 'bold' }}
        name="file" types={FILE_TYPES} hoverTitle="Drop here" maxSize={MAX_FILE_SIZE} disabled={uploading}
        handleChange={handleFileChange} onSizeError={onSizeError} onTypeError={onTypeError}>
        <div className={styles.uploaderOuter}>
          {uploading ? <span className={"icon-loop animate-spin " + styles.icon} /> :
            (uploadResult === 1 ? <span className={"icon-check-circle " + styles.icon} /> :
              <span className={"icon-file-text " + styles.icon} />)}
          {renderMessage()}
        </div>
      </FileUploader>
      <div className="mt-6">
        <span className="input-label">Name your first dashboard</span>
        <input type="text" placeholder="Enter dashboard name..."
          onChange={e => handleChange('dashboardName', e.target.value)} />
      </div>
      <div className="mt-1">
        <span className="input-label">Dashboard description</span>
        <input type="text" placeholder="Enter dashboard description..."
          onChange={e => handleChange('dashboardDesc', e.target.value)} />
      </div>
      <div className="button-group">
        <IconButton iconClass="icon-upload-cloud" label={uploading ? "Uploading..." : "Upload"} disabled={uploading} onClick={handleUpload} />
      </div>

      {uploadResult === 0 && <div className={styles.openDashboardOuter}>
        <span>Or you can open an existing dashboard</span>
        <OpenDashboardsView onDashboardLoad={onDashboardLoad} />
      </div>}
    </Panel>
  )
}
