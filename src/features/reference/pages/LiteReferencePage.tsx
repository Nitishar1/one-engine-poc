import { STORAGE_KEYS } from '@/utils/constants';
import { LiteSetupGuide } from '../components/LiteSetupGuide';
import { ReferenceViewer } from '../components/ReferenceViewer';
import { LITE_FILES, LITE_FOLDER, LITE_GROUPS } from '../utils/liteFiles';

/** /ref2: typing reference for the separate OneEngine Lite project. */
export default function LiteReferencePage() {
  if (!LITE_FILES.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg p-6 text-center text-fg">
        <p className="m-0 max-w-md text-[14px] text-fg-secondary">
          The OneEngine Lite files weren't found. They belong in the <code>lite/</code> folder of
          this project.
        </p>
      </div>
    );
  }
  return (
    <ReferenceViewer
      title="OneEngine Lite - typing reference"
      files={LITE_FILES}
      groups={LITE_GROUPS}
      storageKey={STORAGE_KEYS.typingProgressLite}
      downloadName={LITE_FOLDER}
      renderSetup={({ files, lines }) => (
        <LiteSetupGuide requiredFiles={files} requiredLines={lines} />
      )}
    />
  );
}
