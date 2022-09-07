import { useEffect, useState } from 'react';
import { fetchRecordings } from '../../api/fetchRecording';
import { useParams } from 'react-router';
import GetAppIcon from '@mui/icons-material/GetApp';
import { IconButton } from '@material-ui/core';

import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import { usePublisher } from '../../hooks/usePublisher';

import styles from './styles';

export default function EndCall() {
  const { push } = useHistory();
  const [recordings, setRecordings] = useState(null);
  const classes = styles();
  const { sessionId } = useParams();

  const { destroyPublisher } = usePublisher();

  const redirectNewMeeting = () => {
    push('/');
  };
  useEffect(() => {
    // if (sessionId !== 'undefined') {
    console.log(sessionId);
    fetchRecordings(sessionId)
      .then((data) => {
        if (data.data) {
          setRecordings(data.data);
        }
      })
      .catch((err) => {
        console.log(err);

        setRecordings(null);
      });
  }, [sessionId, destroyPublisher]);

  // useEffect(() => {
  //   setTimeout(() => {
  //     window.OT.publishers.map((e) => e)[0].destroy();
  //   }, 3000);
  // });

  return (
    <div className={classes.container}>
      <div className={classes.meetingInfo}>
        <h2 style={{ color: 'white' }}>We hope you enjoyed your meeting</h2>
        <h2 style={{ color: 'white' }}>This was powered by Vonage</h2>

        <IconButton
          onClick={redirectNewMeeting}
          className={classes.new__meeting}
        >
          Start new meeting
        </IconButton>
      </div>
      <div className={classes.banner}>
        <Card className={classes.centeredFlex} variant="outlined">
          <CardContent>
            {recordings && recordings.length ? (
              <h3 style={{ color: 'white' }}>Recordings</h3>
            ) : (
              <h3>There are no recordings</h3>
            )}
          </CardContent>
          <CardActions>
            <div className={classes.root}>
              {recordings ? (
                <div className={classes.recording}>
                  <ul>
                    {recordings.map((recording) => (
                      <li key={recording.id}>
                        Started at: {Date(recording.createdAt)}
                        {recording.status === 'available' ? (
                          <Button
                            color="inherit"
                            edge="start"
                            target="_blank"
                            href={recording.url}
                          >
                            <GetAppIcon />
                          </Button>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </CardActions>
        </Card>
      </div>
    </div>
  );
}
