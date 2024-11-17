import React, {useState} from "react";
import styles from './AuthPage.module.css'
import {Button, Form} from "@douyinfe/semi-ui";

function Login({onSignUp, onLogin, onLink, formRef, disabled}) {
  return (
    <div>
      <h2>登录 <span>Web-Chat</span></h2>
      <Form onSubmit={onLogin} style={{width: 400}} ref={formRef}>
        <Form.Input
          field='serverAddress'
          label='ServerAddress'
          style={{width: '100%'}}
          placeholder='Enter your serverAddress'
        />
        <Form.Input
          field='userId'
          label='userId'
          style={{width: '100%'}}
          placeholder='Enter your userid'
        />
        <Form.Input
          field='password'
          label='Password'
          mode={"password"}
          style={{width: '100%'}}
          placeholder='Enter your password'
        />
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
          <Button type="tertiary" onClick={onLink}>Link</Button>
          <Button htmlType='submit' type="tertiary" disabled={disabled}>Log in</Button>
        </div>
      </Form>
    </div>
  )
}

function Register({onBack, onRegister, onLink, formRef, disabled}) {
  return (
    <div>
      <h2>注册 <span>Web-Chat</span></h2>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <Form onSubmit={onRegister} style={{width: 400}} ref={formRef}>
          <Form.Input
            field='serverAddress'
            label='ServerAddress'
            style={{width: '100%'}}
            placeholder='Enter your serverAddress'
          />
          <Form.Input
            field='username'
            label='username'
            style={{width: '100%'}}
            placeholder='Enter your username'/>
          <Form.Input
            field='userId'
            label='userId'
            style={{width: '100%'}}
            placeholder='Enter your userid'/>
          <Form.Input
            field='password'
            label='Password'
            mode={"password"}
            style={{width: '100%'}}
            placeholder='Enter your password'/>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <Button theme='borderless'
                    style={{
                      color: 'var(--semi-color-primary)',
                      marginLeft: 10,
                      cursor: 'pointer'
                    }} onClick={onBack}>Back</Button>
            <Button type="tertiary" onClick={onLink}>Link</Button>
            <Button htmlType='submit' type="tertiary" disabled={disabled}>Registry</Button>
          </div>
        </Form>
      </div>
    </div>
  )
}

export default function AuthPage({onLogin, onRegistry, onLink, formRef, disabled, tip}) {
  const [login, setLogin] = useState(true);

  const handleAuthChange = () => {
    setLogin(prev => !prev)
  }

  return (
    <div className={styles.authPageContainer}>
      <div className={styles.formOutSideContainer}>
        <h3 style={{margin:"0px"}}>{tip}</h3>
        {
          login ?
            <Login onLogin={onLogin} onSignUp={handleAuthChange} onLink={onLink} formRef={formRef} disabled={disabled}/>
            :
            <Register onRegister={onRegistry} onBack={handleAuthChange} onLink={onLink} formRef={formRef}
                      disabled={disabled}/>
        }
      </div>
    </div>
  )
    ;
}
