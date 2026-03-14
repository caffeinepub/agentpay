import { HttpAgent } from "@icp-sdk/core/agent";
import { useState } from "react";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";
import { useInternetIdentity } from "./useInternetIdentity";

export function useUploadBlob() {
  const { identity } = useInternetIdentity();
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const upload = async (file: File): Promise<string> => {
    setIsUploading(true);
    setProgress(0);
    try {
      const config = await loadConfig();
      const agentOpts: { identity?: typeof identity; host?: string } = {};
      if (identity) agentOpts.identity = identity;
      if (config.backend_host) agentOpts.host = config.backend_host;
      const agent = new HttpAgent(agentOpts);
      if (config.backend_host?.includes("localhost")) {
        await agent.fetchRootKey().catch(() => {});
      }
      const storageClient = new StorageClient(
        config.bucket_name,
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        agent,
      );
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { hash } = await storageClient.putFile(bytes, (pct) =>
        setProgress(pct),
      );
      return hash;
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, progress, isUploading };
}
