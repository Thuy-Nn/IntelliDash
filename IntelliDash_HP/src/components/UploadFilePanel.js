"use client"
import { useState } from "react"
import { FileUploader } from "react-drag-drop-files"
import styles from '../styles/UploadFilePanel.module.css'
import IconButton from "./IconButton"
import OpenDashboardsView from "./OpenDashboardsView"
import Panel from "./Panel"


const FILE_TYPES = ["CSV", "XLSX", "XLS", "JSON"]
const MAX_FILE_SIZE = 10 // in MB


export default function UploadFilePanel({ isOpen, onClose }) {
    const [selectedFile, setSelectedFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [message, setMessage] = useState("")
    const [successfullyUploaded, setSuccessfullyUploaded] = useState(false)

    const handleFileChange = (file) => {
        setSelectedFile(file)
        setMessage("")
        setSuccessfullyUploaded(false)
    }

    const onSizeError = file => {
        setMessage(`File size exceeds the maximum limit of ${MAX_FILE_SIZE}MB.`)
        if (selectedFile) setSelectedFile(null)
        setSuccessfullyUploaded(false)
    }

    const onTypeError = file => {
        setMessage(`File type not supported. Allowed types: ${FILE_TYPES.join(", ")}`)
        if (selectedFile) setSelectedFile(null)
        setSuccessfullyUploaded(false)
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

            const response = await fetch("http://localhost:5000/upload", {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                const err = await response.json().catch(() => ({}))
                throw new Error(err.error || "Upload failed")
            }

            const data = await response.json()
            setMessage(`Uploaded: ${data.file_path}`)
            setSuccessfullyUploaded(true)
        } catch (error) {
            setMessage(error.message || "Upload failed")
            setSuccessfullyUploaded(false)
        } finally {
            setUploading(false)
        }
    }

    const renderMessage = () => {
        if (selectedFile) return <>
            <span>Selected file: </span>
            <span className={styles.selectedFile}>{selectedFile.name}</span>
        </>
        if (message) return <span className={successfullyUploaded ? styles.message__positive : styles.message__negative}>{message}</span>
        return <span className={styles.message}>Drag & drop a file here, or click to select a file (Max size: {MAX_FILE_SIZE}MB)</span>
    }

    return (
        <Panel title="Upload Data File" isOpen={isOpen} onClose={onClose}>
            <FileUploader dropMessageStyle={{ backgroundColor: 'rgba(0,0,0,0.99)', fontWeight: 'bold' }}
                name="file" types={FILE_TYPES} hoverTitle="Drop here" maxSize={MAX_FILE_SIZE} disabled={uploading}
                handleChange={handleFileChange} onSizeError={onSizeError} onTypeError={onTypeError}>
                <div className={styles.uploaderOuter}>
                    {uploading ? <span className={"icon-loop animate-spin " + styles.icon} /> :
                        (successfullyUploaded ? <span className={"icon-check-circle " + styles.icon} /> :
                            <span className={"icon-file-text " + styles.icon} />)}
                    {renderMessage()}
                </div>
            </FileUploader>
            <div className="mt-6">
                <span className="input-label">Name your first dashboard</span>
                <input type="text" placeholder="Enter dashboard name..." />
            </div>
            <div className="button-group">
                <IconButton iconClass="icon-upload-cloud" label={uploading ? "Uploading..." : "Upload"} disabled={uploading} onClick={handleUpload} />
            </div>

            <div className={styles.openDashboardOuter}>
                <span>Or you can open an existing dashboard</span>
                <OpenDashboardsView />
            </div>
        </Panel>
    )
}
