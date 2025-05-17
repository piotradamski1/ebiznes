import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlin.system.exitProcess

@Serializable
data class DiscordMessage(val content: String)

suspend fun sendToDiscord(webhookUrl: String, text: String) {
    val client = HttpClient(CIO) {
        install(ContentNegotiation) {
            json(
                Json {
                    prettyPrint = false
                    ignoreUnknownKeys = true
                }
            )
        }
    }

    val response: HttpResponse = client.post(webhookUrl) {
        contentType(ContentType.Application.Json)
        setBody(DiscordMessage(text))
    }

    println(
        if (response.status.isSuccess()) "OK (${response.status})"
        else "Nie wyslano (${response.status})"
    )
    client.close()
}

fun main(args: Array<String>) {
    val url = System.getenv("DISCORD_WEBHOOK_URL")
        ?: run {
            println("Ustaw zmienna srodowiskowa DISCORD_WEBHOOK_URL!")
            exitProcess(1)
        }

    val msg = if (args.isNotEmpty()) args.joinToString(" ") else {
        print("Wpisz wiadomosc: "); readLine() ?: ""
    }

    kotlinx.coroutines.runBlocking { sendToDiscord(url, msg) }
}
