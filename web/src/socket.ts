import { EventEmitter } from "events";

export type SocketData = any;

export interface SocketMessage {
  name: string;
  data: SocketData;
}

// Socket class to construct and provide methods for WebSocket connections.
export default class Socket {
  ws: WebSocket;
  ee: EventEmitter;

  constructor(url: string, ee = new EventEmitter()) {
    const ws = new WebSocket(url);

    this.ws = ws;
    this.ee = ee;
    // attach message function as event listener for incoming websocket messages.
    ws.onmessage = this.message.bind(this);
    // attach open function tas event listener on websocket connections.
    ws.onopen = this.open.bind(this);
    // attache close function as listener on websocket disconnections.
    ws.onclose = this.close.bind(this);
    // attache error function as listener on websocket errors.
    ws.onerror = this.error.bind(this);
  }

  isOpen() {
    return this.ws && this.ws.readyState === this.ws.OPEN;
  }

  // on adds a function as an event consumer/listener.
  on(name: string, fn: (...args: any[]) => void) {
    this.ee.on(name, fn);
  }

  // off removes a function as an event consumer/listener.
  off(name: string, fn: (...args: any[]) => void) {
    this.ee.removeListener(name, fn);
  }

  // open handles a connection to a websocket.
  open() {
    this.ee.emit("connect");
  }

  // close to handles a disconnection from a websocket.
  close() {
    this.ee.emit("disconnect");
  }

  // error handles an error on a websocket.
  error(ev: Event) {
    console.log("websocket error: ", ev);
    // try {
    //   // console.log("websocket error: ", ev);
    //   console.log(this.ee);
    //   this.ee.emit("error", ev);
    // } catch (emitErr) {
    //   console.log("EMIT ERR:", emitErr);
    // }
  }

  // emit sends a message on a websocket.
  emit(name: string, data: any) {
    console.log("EMIT:", name);
    const message = JSON.stringify({ name, data });
    this.ws.send(message);
  }

  // message handles an incoming message and forwards it to an event listener.
  message(e: any) {
    try {
      const message = JSON.parse(e.data);

      console.log(message);
      this.ee.emit(message.name, message.data);
    } catch (err) {
      this.ee.emit("error", err);
      console.log(Date().toString() + ": ", err);
    }
  }
}
