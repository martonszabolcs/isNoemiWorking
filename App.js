
import React from 'react';
import {
  SafeAreaView,
  Image,
  StyleSheet,
  View,
  Text,
  StatusBar,
  ImageBackground,
  Dimensions,
  AppState,
} from 'react-native';
import moment from 'moment';
const width = Dimensions.get('window').width;
const googleSheetUrl =
  'https://spreadsheets.google.com/feeds/cells/1bnfTQ-kK5vSgoyYQdwrUX25sx7NZu3hQA-AU93cnc2g/1/public/full?alt=json';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      isThere: false,
    };
  }

  componentDidMount() {
    this.getDates();
    AppState.addEventListener('change', this._handleAppStateChange);
  }
  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }
  _handleAppStateChange = nextAppState => {
    if (nextAppState === 'active') {
      this.getDates();
    }
  };
  getDates() {
    fetch(googleSheetUrl)
      .then(response => response.json())
      .then(responseJson => {
        const entrys = responseJson.feed.entry;
        let data = [];
        let _data = {date: '', from: '', to: ''};
        entrys.forEach(e => {
          if (e.title.$t.includes('A') && e.title.$t !== 'A1') {
            _data.date = e.content.$t;
          }
          if (e.title.$t.includes('B') && e.title.$t !== 'B1') {
            _data.from = e.content.$t;
          }
          if (e.title.$t.includes('C') && e.title.$t !== 'C1') {
            _data.to = e.content.$t;
          }
          if (_data.from !== '' && _data.date !== '' && _data.to !== '') {
            data.push(_data);
            _data = {date: '', from: '', to: ''};
          }
        });

        let isThere = data.find(e => {
          const from = moment(e.date + ' ' + e.from, 'YYYY-MM-DD HH:mm');
          const to = moment(e.date + ' ' + e.to, 'YYYY-MM-DD HH:mm');

          if (moment(new Date()).isBetween(from, to)) return e;
        });

        this.setState({data, isThere});
      })
      .catch(error => {
        console.log(error);
      });
  }
  closest(data) {
    let index;
    data.forEach((e, i) => {
      if (moment(e.date).format('YYYY MM DD') === moment().format('YYYY MM DD')) {
        index = i;
      }
    });
    return data.length > index
      ? moment(data[index + 1].date).format('dddd') + ' ' + data[index + 1].from + ' - ' + data[index + 1].to
      : '';
  }
  render() {
    const {data, isThere} = this.state;
    return (
      <>
        <StatusBar barStyle="dark-content" />
        <ImageBackground source={require('./src/bg.png')} resizeMode="cover" style={styles.bgImage}>
          <SafeAreaView style={styles.container}>
            <View
              style={[
                styles.imageback,
                {
                  backgroundColor: isThere ? 'white' : '#736452',
                },
              ]}>
              <Image source={require('./src/noemi.png')} style={[styles.imageNoemi, {opacity: isThere ? 1 : 0.6}]} />
            </View>
            <View style={styles.containerDown}>
              <View style={styles.textContainer}>
                <Text
                  style={[
                    styles.text,
                    {
                      fontSize: 22,
                      fontFamily: 'Lato-Bold',
                      fontWeight: 'bold',
                    },
                  ]}>
                  {isThere ? 'Noemi is' : 'Noemi is on a'}
                </Text>
                <Text style={[styles.text, isThere ? styles.isThereText : styles.noThereText]}>
                  {isThere ? 'WORKING!' : 'SIESTA'}
                </Text>
                {isThere && (
                  <Text
                    style={[
                      styles.text,
                      {
                        color: '#4D4032',
                        fontWeight: 'normal',
                      },
                    ]}>
                    {' '}
                    {isThere.from + ' - ' + isThere.to}
                  </Text>
                )}
                {!isThere && (
                  <Text
                    style={[
                      styles.text,
                      {
                        color: '#4D4032',
                        fontSize: 16,
                        fontWeight: 'normal',
                      },
                    ]}>
                    {' '}
                    next shift:
                  </Text>
                )}
                {!isThere && (
                  <Text
                    style={[
                      styles.text,
                      {
                        color: '#4D4032',
                        fontWeight: 'normal',
                        fontSize: 26,
                      },
                    ]}>
                    {' '}
                    {this.closest(data)}
                  </Text>
                )}
                <View style={styles.line} />
              </View>
              <View style={styles.dateContainer}>
                <Text
                  style={[
                    styles.text,
                    {
                      color: '#4D4032',
                      fontSize: 24,
                      fontWeight: '500',
                      marginBottom: 10,
                    },
                  ]}>
                  Upcoming shifts:
                </Text>
                {data.map((e, i) => {
                  if (moment(e.date).isBefore(new Date(), 'day')) return;
                  if (
                    moment(e.date)
                      .isoWeekday(1)
                      .format('ww') ===
                    moment()
                      .isoWeekday(1)
                      .format('ww')
                      .toString()
                  ) {
                    return (
                      <View key={i} style={styles.dates}>
                        <Text style={isThere === e ? styles.bold : styles.normalText}>
                          {' • '}
                          {moment(e.date, 'YYYY-MM-DD HH:mm:ss').format('dddd')}
                          {',  '}
                        </Text>
                        <Text style={isThere === e ? styles.bold : styles.normalText}>
                          {e.from}
                          {' - '}
                        </Text>
                        <Text style={isThere === e ? styles.bold : styles.normalText}>{e.to} </Text>
                      </View>
                    );
                  }
                })}
              </View>
            </View>
          </SafeAreaView>
        </ImageBackground>
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
  },
  containerDown: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 20,
  },
  text: {
    fontFamily: 'Lato-Regular',
    fontWeight: '900',
    fontSize: 30,
    marginTop: 5,
    color: '#725E47',
  },
  textContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  isThereText: {
    color: '#4D4032',
    fontFamily: 'Lato-Bold',
    fontWeight: 'bold',
  },
  imageNoemi: {
    borderRadius: 100,
    width: 200,
    height: 200,
  },
  bgImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  dateContainer: {
    marginBottom: 0,
    width: width - 80,
  },
  line: {
    height: 1,
    marginTop: 20,
    width: 80,
    backgroundColor: 'black',
  },
  dates: {flexDirection: 'row', marginTop: 5},
  imageback: {
    width: 220,
    justifyContent: 'center',
    alignItems: 'center',
    height: 220,
    borderRadius: 220 / 2,
    marginTop: 30,
    borderWidth: 4,
    borderColor: '#736452',
  },
  bold: {
    fontWeight: 'bold',
    fontFamily: lato,
    fontSize: 18,
    color: '#4D4032',
  },
  noThereText: {
    color: '#96826C',
    fontFamily: 'Lato-Bold',
    fontWeight: 'bold',
  },
  normalText: {
    fontFamily: 'Lato-Regular',
    fontSize: 18,
    fontWeight: 'normal',
    color: '#4D4032',
  },
});

export default App;
