import os
import tornado.web
import tornado.websocket
import tornado.httpserver
import tornado.ioloop


class WebSocketHandler(tornado.websocket.WebSocketHandler):
    #all connected users
    connections = set()
    #currect icon concoordinates
    coordinates = {'X': 50, 'Y': 50}

    def check_origin(self, origin):
        return True

    def open(self):
        WebSocketHandler.connections.add(self)
        self.write_message(self.coordinates)
        #self.callback = tornado.ioloop.PeriodicCallback(self.write_message(self.coordinates), 2000)
        #self.callback.start()

    def on_close(self):
        WebSocketHandler.connections.remove(self)
        #self.callback.stop()

    def on_message(self, message):
        if (message != "PING"):
            self.procCoordinates(message)
            for connection in self.connections:
                connection.write_message(self.coordinates)

    def procCoordinates(self, message):
        """To transform received message into coordinates and check them"""
        X = int(message[:message.find(';')])
        Y = int(message[message.find(';')+1:])
        if X < 0 or X > 100 or Y < 0 or Y > 100:
            self.write_message({'error': "Нарушен диапазон значений: 0..100"})
        else:
            self.coordinates['X'] = X
            self.coordinates['Y'] = Y



class IndexPageHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("index.html")


class Application(tornado.web.Application):
    def __init__(self):
        handlers = [
            (r'/', IndexPageHandler),
            (r'/websocket', WebSocketHandler)
        ]

        settings = {
            'template_path': 'templates',
            'static_path': 'static'
        }
        tornado.web.Application.__init__(self, handlers, **settings)


if __name__ == '__main__':

    server = Application()
    serv = tornado.httpserver.HTTPServer(server)
    port = int(os.environ.get("PORT", 8080))
    print("Server has been started. Listening port:"+str(port)+"\nPress Ctrl-C to interrupt.")
    serv.listen(port)
    tornado.ioloop.IOLoop.instance().start()


