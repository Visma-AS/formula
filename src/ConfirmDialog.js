import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core';
import useDarkMode from '@super-template/lab/src/darkMode/useDarkMode';
import produce from 'immer';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { FormattedMessage } from 'react-intl';
import { useConfig } from './api';

const preventDefault = (event) => {
  event.preventDefault();
};

export const isCaptchaRequired = (config) =>
  config.publicForm &&
  // Form may not have `requireCaptcha` defined.
  (config.requireCaptcha || config.requireCaptcha === undefined);

export default forwardRef(function ConfirmDialog(
  { title, description, children, onConfirm, ...other },
  ref
) {
  useImperativeHandle(ref, () => ({
    confirm(...args) {
      return new Promise((resolve) => {
        confirmRef.current = function (confirm) {
          resolve(
            isCaptchaRequired(other.config)
              ? confirm &&
                  produce(args, ([data]) => {
                    data.captchaChallenge = confirm;
                  })
              : confirm
          );
        };
        setOpen(true);
      });
    },
  }));

  const confirmRef = useRef();

  const [open, setOpen] = useState(false);
  const [showReCAPTCHA, setShowReCAPTCHA] = useState(
    isCaptchaRequired(other.config)
  );
  const [captchaChallenge, setCaptchaChallenge] = useState();
  const [darkMode] = useDarkMode();
  const { recaptcha } = useConfig();

  function handleClose() {
    setOpen(false);
    if (showReCAPTCHA && captchaChallenge) {
      setShowReCAPTCHA(false);
    }
  }

  function handleDismiss() {
    handleClose();
    confirmRef.current(false);
  }

  function handleConfirm() {
    handleClose();
    confirmRef.current(
      isCaptchaRequired(other.config) ? captchaChallenge : true
    );
  }

  return (
    <Dialog
      open={open}
      onClose={handleDismiss}
      onClick={preventDefault}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
      {description && (
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            {description}
          </DialogContentText>
        </DialogContent>
      )}
      {showReCAPTCHA && (
        <DialogContent>
          <ReCAPTCHA
            sitekey={recaptcha.sitekey}
            onChange={setCaptchaChallenge}
            theme={darkMode ? 'dark' : 'light'}
          />
        </DialogContent>
      )}
      <DialogActions>
        <Button onClick={handleDismiss}>
          <FormattedMessage defaultMessage="Peruuta" />
        </Button>
        <Button
          disabled={showReCAPTCHA && !captchaChallenge}
          onClick={handleConfirm}
          variant="contained"
          color="primary"
          autoFocus
        >
          <FormattedMessage defaultMessage="Lähetä" />
        </Button>
      </DialogActions>
    </Dialog>
  );
});
