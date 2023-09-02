
import React from 'react'
import { useEffect, useState } from "react"
import reactCSS from 'reactcss'
import { SketchPicker } from 'react-color'
import { userContext } from './userContext.jsx';
import { useContext } from 'react';
import axios from 'axios';
import hexRgb from 'hex-rgb';

let displaynamechar = "";
let usercolor = "";
let username2 = "";
let displayname2 = "";
let hexusercolors = [];


export function getContext() {
    const {username, id, displayname, color} = useContext(userContext);
    displaynamechar = displayname[0];
    username2 = username;
    usercolor = color;
    hexusercolors = hexRgb(color, {format: 'array'});

    displayname2 = displayname;
}

class SketchExample extends React.Component {



  state = {
    displayColorPicker: false,
    color: {
      r: String(hexusercolors[0]),
      g: String(hexusercolors[1]),
      b: String(hexusercolors[2]),
      a: String(hexusercolors[3]),
    },
    displaynamecharstate: displaynamechar,
  };
  

  handleClick = () => {
    this.setState({ displayColorPicker: !this.state.displayColorPicker })
  };

  handleClose = () => {
    this.setState({ displayColorPicker: false })
  };

  handleChange = (color) => {
    this.setState({ color: color.rgb })


    async function updateColor(colorin) {

      const color = colorin.hex;
      /* console.log(user,userdisplayname,currentcolor); */
      console.log(color);
      const username = username2;
      const displayname = displayname2;
      const {data} = await axios.post('/updateaccount', {username, displayname, color});
  }
  updateColor(color);

  };

  render() {

    

    const styles = reactCSS({
      'default': {
        color: {
          width: '40px',
          height: '40px',
          borderRadius: '1000px',
          background: `rgba(${ this.state.color.r }, ${ this.state.color.g }, ${ this.state.color.b }, ${ this.state.color.a })`,
        },
        swatch: {
          padding: '2px',
          display: 'inline-block',
          cursor: 'pointer',
        },
        popover: {
          position: 'absolute',
          bottom: '70px',
          zIndex: '2',
        },
        cover: {
          position: 'fixed',
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        },
      },
    });

    return (
      <div>
        <div style={ styles.swatch } onClick={ this.handleClick }>
          <div style={ styles.color } className='flex items-center'> 
          <span className="text-center w-full font-bold">{this.state.displaynamecharstate}</span> </div>
        </div>
        { this.state.displayColorPicker ? <div style={ styles.popover }>
          <div style={ styles.cover } onClick={ this.handleClose }/>
          <SketchPicker color={ this.state.color } onChange={ this.handleChange } />
        </div> : null }

      </div>
    )
  }
}


export default SketchExample