import React ,{ Component } from 'react'
import { StyleSheet, 
        View, 
        ImageBackground, 
        Text,
        FlatList,
        TouchableOpacity,
        
    } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment'
import 'moment/locale/pt-br'
import todayImage from '../../assets/imgs/today.jpg'
import commonStyle from '../commonStyle'
import Task from '../components/Task'   
import Icon from 'react-native-vector-icons/FontAwesome'
import ActionButton from 'react-native-action-button'
import AddTask from './AddTask'




export default class Agenda extends Component {

    state = {
        tasks : [],
        visibleTasks : [],
        showDoneTasks : true,
        showAddTask: false,

    }

    addTask = task => {
        const tasks = [...this.state.tasks] 
        tasks.push({
            id: Math.random(),
            desc: task.desc,
            estimateAt: task.date,
            doneAt: null,

        })

        this.setState({ tasks, showAddTask: false}, this.filterTasks)
    }

    deleteTask = id => {
        const tasks = this.state.tasks.filter( task => task.id !== id)
        this.setState({ tasks }, this.filterTasks)
    }

    componentDidMount = async () => {
        const data = await AsyncStorage.getItem('tasks')
        const tasks = JSON.parse(data) || []
        this.setState({ tasks }, this.filterTasks)
    }

    toggleFilter = () => {
        this.setState({ showDoneTasks: !this.state.showDoneTasks }, this.filterTasks)
    }

    filterTasks = () => {
        let visibleTasks = null
        if(this.state.showDoneTasks === true){
            visibleTasks = [...this.state.tasks]
        }
        else{
            const pending = task => task.doneAt === null
            visibleTasks = this.state.tasks.filter(pending)
        }
        this.setState({ visibleTasks })
        AsyncStorage.setItem('tasks', JSON.stringify(this.state.tasks))
    }

    toggleTask = id => {
        const tasks = this.state.tasks.map(task =>{
            if(task.id === id){
                task = {...task}
                task.doneAt = task.doneAt ? null : new Date()
            }
            return task
        }) 
        this.setState({ tasks }, this.filterTasks)
    }


    render(){
        return (
            <View style = {styles.container}>
                <AddTask isVisible={this.state.showAddTask} 
                    onSave={this.addTask}
                    onCancel={() => this.setState({ showAddTask: false })} />  
                <ImageBackground source={todayImage} style={styles.background}>
                    <View style={styles.titleBar}>
                        <Text style={styles.title}>Hoje</Text>
                        <Text style={styles.subtitle}>{moment().locale('pt-br').format("dddd, D [de] MMMM")}</Text>
                    </View>
                    <View style={styles.iconBar}>
                        <TouchableOpacity onPress={this.toggleFilter}>
                            <Icon name={this.state.showDoneTasks ? 'eye' : 'eye-slash'} size={20} color={commonStyle.colors.secundary}/>
                        </TouchableOpacity>
                    </View> 
                </ImageBackground>
                
                <View style={styles.taksContainer}>
                    <FlatList data={this.state.visibleTasks} 
                            keyExtractor={ item => `${item.id}`} 
                            renderItem={({ item }) =>
                            <Task {...item} toggleTask={this.toggleTask} onDelete={this.deleteTask} />}  />
                </View>
                <ActionButton buttonColor={commonStyle.colors.today}
                    onPress={ () => { this.setState({ showAddTask: true })}} />
            </View> 
        )
        
    }

}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 3,
    
    },
    titleBar:{
        flex:1,
        justifyContent: 'flex-end',
    },
    title: {
        fontFamily: commonStyle.fontFamily,
        color: commonStyle.colors.secundary,
        fontSize: 50,
        marginLeft: 20,
        marginBottom: 10,
 
    },
    subtitle:{
        fontFamily: commonStyle.fontFamily,
        color: commonStyle.colors.secundary,
        fontSize: 20,
        marginLeft: 20,
        marginBottom: 30,
    },

    taksContainer: {
        flex: 7,
    },

    iconBar : {
        marginBottom: 10,
        marginRight: 20,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    }


});