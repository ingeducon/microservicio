# Microservices con Mongo y Netlify

Para hacer uso de MongoDB usaremos el servicio de Mongo Atlas. Usaremos microservicios en Netlify con Netlify functions como se vio en [este](https://github.com/ada-school/TS-microservices-netlify) laboratorio.

# Laboratorio

### Microservicios con MongoDB

Crearemos un API CRUD para las fotos de los perros que se trabajaron en el laboratorio anterior.

- Crea una cuenta en [Mongo Atlas](https://www.mongodb.com/cloud/atlas), podras usar la cuenta gratuitamente
- para crear un cluster de prueba, usa alguna zona que incluya un `free tier` y que se encuentre mas cerca a tu ubicacion, por ejemplo: AWS N. Virginia para Colombia
- Crea un usuario que pueda leer y escribir en tu cluster, apunta el nombre de usuario y contraseña ya que lo usaremos luego
- _Importante_ Permite el acceso desde cualquier IP, esto permitira hacer las pruebas mas facilmente
- Espera a que el cluster esté creado
- _Importante_ No inicialices ningunos datos de prueba ya que se crearan en el ejercicio
- Obten las credenciales para poder conectarte desde tus funciones de Netlify, para esto puedes dar click al boton "Connect" -> "Connect your application"
- Si tienes dudas sigue este [video](https://www.youtube.com/watch?v=rPqRyYJmx2g) tutorial
- Descarga un cliente de MongoDB, recomendamos [Robo 3T](https://robomongo.org/)
- Prueba que tus credenciales funcionen correctamente usando tu cliente de mongo para conectarte al cluster
- Haz fork de este repositorio en tu cuenta de Github
- Crea un nuevo sitio en Netlify y conectalo con el repositorio que acabas de copiar, recuerda usar el comando `yarn netlify login` y el comando `yarn netlify link`
- Recuerda vincular tu repositorio local con el sitio de Netlify, de esta manera podras tener las variables de entorno disponibles localmente para pruebas
- Como parte de las [buenas practicas](https://12factor.net/), configuraremos las credenciales de la BD como parte de las variables de entorno, crea en Netlify una variable de entorno llamada `MONGO_DB_URI` con la url de conexión que obtienes de Mongo Atlas. Para esto busca en Netlify el menu `Sites` -> selecciona tu sitio -> `Site Settings` -> `Build & Deploy` -> `Environment` y añade la nueva variable, por ejemplo:

```
MONGO_DB_URI=mongodb+srv://dbUser:<password>@cluster0.qitdn.mongodb.net/dogosDatabase?retryWrites=true&w=majority
```

> Nota el nombre de la base de datos, esta definido en este caso como `dogosDatabase`

- La variable de entorno sera mapeada en el archivo `config.ts` esto para tener las variables centralizadas para organizar mejor el código

- Usaremos la libreria [Mongoose](https://mongoosejs.com/) que nos ayudara a definir modelos de la base de datos desde el código, esto hace que los modelos se puedan cambiar facilmente segun la aplicación vaya evolucionando
- Crea en la carpeta models, un archivo llamado `DogoModel.ts`, usaremos upper camel case como buena práctica ya que esto se usará como una clase
- Inserta el siguiente código que definirá un modelo y un nombre de la colección para los records de nuestro API

```typescript
import { model, Schema } from "mongoose";

export interface Dogo {
  name: string;
  imageURL: string;
  age?: number;
}

const schema = new Schema<Dogo>({
  name: { type: String, required: true },
  imageURL: { type: String, required: true },
  age: { type: Number },
});

export const DogoModel = model<Dogo>("dogos", schema);
```

> Nota el uso de Generics para definir los tipos del modelo en el schema, esto facilita el desarrollo ya que TypeScript sabrá acerca de la forma de nuestros objetos

- Haremos uso del modelo para crear un nuevo record en respuesta a un llamado `POST`, crea un archivo llamado `createDogos.ts` con el siguiente contenido.

```typescript
import { Handler } from "@netlify/functions";
import { connectDatabase } from "../../db";
import { DogoModel } from "../../models/DogoModel";

export const createDogos: Handler = async (context, event) => {
  try {
    if (context.headers["content-type"] !== "application/json") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Invalid content type, expected application/json",
        }),
      };
    }

    const { body } = context;
    const parsedBody = body && body.length > 0 ? JSON.parse(body) : null;

    if (parsedBody && "name" in parsedBody && "imageURL" in parsedBody) {
      await connectDatabase();

      const newDogo = new DogoModel({
        name: parsedBody.name,
        imageURL: parsedBody.imageURL,
        age: parsedBody.age,
      });

      await newDogo.save();

      return {
        statusCode: 200,
        body: JSON.stringify({
          dogo: newDogo,
        }),
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Invalid input, name and imageURL are required",
        }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error,
      }),
    };
  }
};
```

> Nota que la conexión a la base de datos solo se hace cuando sea necesario, de otra forma la funcion gastaría más tiempo en ejecutar

- Ajusta el código de la funcion `dogos.ts` para poder soportar el métodos `POST` y poder llamar a la función creada en el paso anterior
- Prueba tu API usando [Postman](https://www.postman.com/downloads/), recuerda enviar la peticion post con el encabezado `content-type: application/json`
- Crea/Ajusta los metodos correspondientes para poder:
  - actualizar un solo registro
  - borrar un solo registro
  - listar un solo registro
  - listar los primeros 10 registros

### Tips

- ¿Cómo actualizar un registro en Mongoose?

```typescript
const dogo = dogoId ? await DogoModel.findById(dogoId) : null;
const newName = "Duck"; // This data might come from context.body

if (dogo) {
  await dogo.set({ name: newName }).save();
} else {
  // dogo not found
}
...
```

- ¿Cómo borrar un registro en Mongoose?

```typescript
const dogo = dogoId ? await DogoModel.findById(dogoId) : null;

if (dogo) {
  await dogo.remove();
} else {
  // dogo not found
}
...
```

- ¿Como poder leer la url dentro de una función de Netlify?

```typescript
const path = context.path;
const pathParts = path.split("/api/dogos/");
...
```

- ¿Cómo listar registros en Mongoose usando un limite?

```typescript
const dogos = await DogoModel.find({}).skip(0).limit(10);
...
```
