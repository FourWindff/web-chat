import React, {useState} from "react";
import styles from './AuthPage.module.css'
import {Button, Form} from "@douyinfe/semi-ui";

function Login({onSignUp, onLogin, defaultServerAddress}) {
  const defaultUserId = "1369050535";
  const defaultPassword = "123";
  return (
    <div>
      <h2>登录 <span>Web-Chat</span></h2>
      <Form onSubmit={onLogin} style={{width: 400}}>
        <Form.Input
          field='serverAddress'
          label='ServerAddress'
          style={{width: '100%'}}
          placeholder='Enter your serverAddress'
          initValue={defaultServerAddress}
        />
        <Form.Input
          field='userId'
          label='userId'
          style={{width: '100%'}}
          placeholder='Enter your userid'
          initValue={defaultUserId}/>
        <Form.Input
          field='password'
          label='Password'
          mode={"password"}
          style={{width: '100%'}}
          placeholder='Enter your password'
          initValue={defaultPassword}/>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <p>
            <span>Or</span>
            <Button
              theme='borderless'
              style={{
                color: 'var(--semi-color-primary)',
                marginLeft: 10,
                cursor: 'pointer'
              }}
              onClick={onSignUp}>Sign up</Button>
          </p>
          <Button htmlType='submit' type="tertiary">Log in</Button>
        </div>
      </Form>
    </div>
  )
}

function Register({onBack, onRegister, defaultServerAddress}) {
  return (
    <div>
      <h2>注册 <span>Web-Chat</span></h2>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <Form onSubmit={onRegister} style={{width: 400}}>
          <Form.Input
            field='serverAddress'
            label='ServerAddress'
            style={{width: '100%'}}
            placeholder='Enter your serverAddress'
            initValue={defaultServerAddress}
          />
          <Form.Input
            field='username'
            label='username'
            style={{width: '100%'}}
            placeholder='Enter your username'/>
          <Form.Input
            field='userId'
            label='userId'
            mode={"password"}
            style={{width: '100%'}}
            placeholder='Enter your userid'/>
          <Form.Input
            field='password'
            label='Password'
            style={{width: '100%'}}
            placeholder='Enter your password'/>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <Button theme='borderless'
                    style={{
                      color: 'var(--semi-color-primary)',
                      marginLeft: 10,
                      cursor: 'pointer'
                    }} onClick={onBack}>Back</Button>
            <Button htmlType='submit' type="tertiary">Registry</Button>
          </div>
        </Form>
      </div>
    </div>
  )
}

export default function AuthPage({onLogin, onRegistry, defaultServerAddress}) {
  const [login, setLogin] = useState(true);

  const handleAuthChange = () => {
    setLogin(prev => !prev)
  }

  return (
    <div className={styles.authPageContainer}>
      <div className={styles.formOutSideContainer}>
        {
          login ?
            <Login onLogin={onLogin} onSignUp={handleAuthChange} defaultServerAddress={defaultServerAddress}/>
            :
            <Register onRegister={onRegistry} onBack={handleAuthChange} defaultServerAddress={defaultServerAddress}/>
        }
      </div>
    </div>
  )
    ;
}
