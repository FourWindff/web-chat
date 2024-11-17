import {Button, Form} from "@douyinfe/semi-ui";
import React from "react";


export function AddFriend({onAddRequest}) {
  return (
    <div>
      <Form onSubmit={onAddRequest}>
        <Form.Input
          field={"userId"}
          label={"userId"}
          style={{
            background: "white",
          }}
          placeholder='Enter your userId'/>/>
        <Button htmlType='submit' type="tertiary" style={{background:"white"}}>Add</Button>
      </Form>
    </div>
  )

}