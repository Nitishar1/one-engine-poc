import { STORAGE_KEYS } from '@/utils/constants';
import { ReferenceViewer } from '../components/ReferenceViewer';
import { SetupGuide } from '../components/SetupGuide';
import { SOURCE_FILES, SOURCE_GROUPS } from '../utils/sourceFiles';

/** /ref: typing reference for this project. Public route so it opens without signing in. */
export default function ReferencePage() {
  return (
    <ReferenceViewer
      title="Typing reference"
      files={SOURCE_FILES}
      groups={SOURCE_GROUPS}
      storageKey={STORAGE_KEYS.typingProgress}
      downloadName="oneEngine_poc_4"
      renderSetup={({ files, lines }) => <SetupGuide requiredFiles={files} requiredLines={lines} />}
    />
  );
}
