var static = require( 'node-static' );
var http = require( 'http' );
var sio = require( 'socket.io' );
var sys = require( 'sys' );

var bodies = CreateBodies();
var updates = [];

//
// Create a node-static server instance to serve the './public' folder
//
var fileServer = new static.Server( '/home/pi/Node/pi-physics/public' );

var httpServer = http.createServer( function( request, response )
{
    request.addListener( 'end', function ()
    {
        fileServer.serve( request, response, function( err, result )
        {
            if ( err )
            {
                // There was an error serving the file
                sys.error( "Error serving " + request.url + " - " + err.message );

                // Respond to the client
                response.writeHead( err.status, err.headers );
                response.end();
            }
        } );
    } );
} );

var httpListener = httpServer.listen( 8080 );
var io = sio.listen( httpListener );

io.sockets.on( 'connection', function( socket )
{
    socket.emit( 'bodies', bodies );

    socket.on( 'addJoint', function( data )
    {
        socket.broadcast.emit( 'addJoint', data );
        console.log( data );
    } );

    socket.on( 'removeJoint', function( data )
    {
        socket.broadcast.emit( 'removeJoint', data );
        console.log( data );
    } );

    socket.on( 'moveJoint', function( data )
    {
        socket.broadcast.emit( 'moveJoint', data );
        console.log( data );
    } );

    socket.on( 'sleeping', function( data )
    {
        console.log( data );

//        if ( !updates[ data.I ] ) updates[ data.I ] = { Clients: [] };

//        updates[ data.I ].Clients[ data.C ] = data;
        bodies[ data.I ].X = data.P.x;
        bodies[ data.I ].Y = data.P.y;
        bodies[ data.I ].A = data.A;
    } );
} );

function CreateBodies()
{
    var bodies = [];

    for( var i = 0; i < 15; ++i )
    {
        var body =
        {
            I: i,
            X: Math.random() * 20,
            Y: Math.random() * 10,
            A: 0.0
        };

        if( Math.random() > 0.5 )
        {
            body.T = 'P';
            body.W = Math.random() + 0.1; //half width
            body.H = Math.random() + 0.1; //half height
        }
        else
        {
            body.T = 'R';
            body.R = Math.random() + 0.1; //radius
        }

        bodies[ body.I ] = body;
    }

    return bodies;
}
