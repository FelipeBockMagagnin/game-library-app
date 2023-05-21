import { Text, View, StyleSheet, TouchableOpacity, Image, ScrollView, Button } from "react-native";
import colors from '../styles/Colors';
import { useState, useEffect } from "react";
import { getToken, get, getImgUrl } from '../services/igdb'
import Loading from "../components/Loading";
import { FontAwesome5 } from '@expo/vector-icons';
import AuthContext from "../contexts/auth";
import { useContext } from "react";
import axios from 'axios';
import { REACT_APP_API_URL } from '../../env';

export default function GameScreen({ route, navigation }) {
  const { name, id } = route.params;

  const { user } = useContext(AuthContext);
  const [game, setGame] = useState({});
  const [loading, setLoading] = useState(true);
  const [gameCurrentStatus, setGameCurrentStatus] = useState(null)

  useEffect(() => {
    axios.get(REACT_APP_API_URL + 'games/' + user.database_data.id + '/' + id).then(x => {
      if (x.data.length > 0) {
        setGameCurrentStatus(x.data[0].current_status);
      }
    }).catch(err => {
      console.log('error', JSON.stringify(err.response.data))
      alert(err)
    })

    get(
      'games', 
      "*, screenshots.image_id, platforms.name, genres.name",
      "id = " + id
    ).then(x => {
      setGame(x.data[0]);
    }).catch(err => {
      console.log(err.response.data)
    }).finally(() => {
      setLoading(false)
    })
  }, [])

  return (
    <ScrollView style={styles.container}>
      <View style={{ display: 'flex', flexDirection: 'row' }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome5 name="angle-left" size={24} color={colors.yellow} />
        </TouchableOpacity>
        <Text style={[styles.title, { marginLeft: 20, marginTop: -4 }]}>{name}</Text>
      </View>

      <View style={{ marginTop: 10 }}>
        <GameContent />
      </View>

    </ScrollView>
  );

  function addGame(status) {
    const data = {
      "game_id": id,
      "user_id": user.database_data.id,
      "current_status": status
    }
    console.log('add Game', status)

    axios.post(REACT_APP_API_URL + 'games', data).then(x => {
      console.log(x)
      setGameCurrentStatus(status);
    }).catch(err => {
      console.log('error', JSON.stringify(err.response.data))
      alert(err.response.data)
    })
  }

  function removeGame() {
    const data = {
      "game_id": id,
      "user_id": user.database_data.id,
    }

    axios.post(REACT_APP_API_URL + 'games/delete', data).then(x => {
      setGameCurrentStatus(null);
    }).catch(err => {
      alert(err.response.data)
      console.log('error', JSON.stringify(err.response.data))
    })
  }

  function gameStatusText(status) {
    let gameTextStatus = "";

    switch (status) {
      case 0:
        gameTextStatus = "Completed"
        break;
      case 1:
        gameTextStatus = "Playing"
        break;
      case 2:
        gameTextStatus = "Want"
        break;
    }

    return gameTextStatus;
  }

  function GameContent() {
    if (loading) {
      return <Loading />
    }

    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const date = new Date(game?.first_release_date * 1000);

    return (
      <View style={styles.pb50}>
        <View style={[styles.mt10]}>
          <ScrollView horizontal={true}>
            {game.screenshots?.map((screenshot, index) => {
              return <Image
                key={index}
                source={{ uri: getImgUrl('t_screenshot_med', screenshot.image_id) }}
                style={styles.imageCover}
              />
            })}
          </ScrollView>
        </View>


        <View style={[styles.flex, styles.mt10]}>
          <FontAwesome5 name="calendar-alt" size={20} color={colors.red} style={{ marginRight: 10 }} />
          <Text style={styles.text}>{months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear()}</Text>
        </View>

        <Text style={[styles.subtitle, styles.mt10]}>
          Genres
        </Text>
        <View style={styles.flex}>
          <ScrollView horizontal={true}>
            {game.genres?.map((genre, index) => {
              return <View key={index} style={styles.tag}>
                <Text style={styles.text}>
                  {genre.name}
                </Text>
              </View>
            })}
          </ScrollView>
        </View>

        <Text style={[styles.subtitle, styles.mt10]}>
          Platforms
        </Text>
        <View style={styles.flex}>
          <ScrollView horizontal={true}>
            {game.platforms?.map((plataform, index) => {
              return <View key={index} style={styles.tag}>
                <Text style={styles.text}>
                  {plataform.name}
                </Text>
              </View>
            })}
          </ScrollView>
        </View>

        <Text style={[styles.subtitle, styles.mt10]}>
          Summary
        </Text>
        <Text style={[styles.text]}>
          {game.summary}
        </Text>

        {gameCurrentStatus == null ? <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginTop: 20 }}>
          <Text style={[styles.title, { textAlign: 'center' }]}>Add to</Text>
          <TouchableOpacity style={styles.button} onPress={() => addGame(0)} >
            <Text style={styles.buttonText}>Completed</Text>
            <Text style={{ textAlign: "center", color: colors.dark_green }}>Finished Games</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => addGame(1)} >
            <Text style={styles.buttonText}>Playing</Text>
            <Text style={{ textAlign: "center", color: colors.dark_green }}>Currently Playing</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => addGame(2)} >
            <Text style={styles.buttonText}>Want</Text>
            <Text style={{ textAlign: "center", color: colors.dark_green }}>Wanted games</Text>
          </TouchableOpacity>
        </View> : <View>
          <Text style={[styles.text, styles.mt20, styles.title, { textAlign: 'center' }]}>Status: {gameStatusText(gameCurrentStatus)}</Text>
          <TouchableOpacity style={styles.button} onPress={() => removeGame()} >
            <Text style={styles.buttonText}>Remove</Text>
            <Text style={{ textAlign: "center", color: colors.dark_green }}>Remove from your library</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => changeStatus()}>
            <Text style={styles.buttonText}>Change Status</Text>
            <Text style={{ textAlign: "center", color: colors.dark_green }}>Update game status</Text>
          </TouchableOpacity>
        </View>}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    margin: 10
  },
  buttonText: {
    color: colors.dark_green,
    fontWeight: "700",
    fontSize: 20,
    textAlign: "center"
  },
  button: {
    width: '100%',
    backgroundColor: colors.yellow,
    borderRadius: 20,
    padding: 10,
    color: '#FFF',
    marginTop: 10
  },
  tag: {
    borderColor: colors.red,
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 10,
    margin: 2,
    paddingHorizontal: 5,
    paddingVertical: 2
  },
  flex: {
    display: 'flex',
    flexDirection: 'row'
  },
  text: {
    fontSize: 15,
    color: '#ddd',
    fontWeight: "500",
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: "500",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.yellow,
  },
  typing: {
    fontSize: 18,
    color: colors.yellow,
    fontWeight: "500",
  },
  imageCover: {
    width: 284.5,
    height: 160,
    borderRadius: 10,
    marginRight: 10,
    elevation: 5,
  },
  mt10: {
    marginTop: 10
  },
  mt20: {
    marginTop: 20
  },
  pb50: {
    marginBottom: 50
  }
});