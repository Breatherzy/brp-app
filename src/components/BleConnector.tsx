import React {Component} from 'react'
import { BleManager } from 'react-native-ble-plx';

class MyComponent extends Component {
    constructor() {
        super()
        this.manager = new BleManager()
        }


        