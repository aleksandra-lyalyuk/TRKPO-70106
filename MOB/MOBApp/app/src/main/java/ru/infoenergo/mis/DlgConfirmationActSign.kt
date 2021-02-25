package ru.infoenergo.mis

import android.Manifest
import android.app.Activity
import android.app.AlertDialog
import android.app.Dialog
import android.app.PendingIntent
import android.content.DialogInterface
import android.content.Intent
import android.content.IntentFilter
import android.os.Bundle
import android.telephony.SmsManager
import android.view.LayoutInflater
import android.view.View
import android.widget.Button
import android.widget.CheckBox
import android.widget.EditText
import android.widget.Toast
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.widget.doOnTextChanged
import androidx.fragment.app.DialogFragment
import androidx.localbroadcastmanager.content.LocalBroadcastManager
import com.google.android.gms.auth.api.phone.SmsRetriever
import com.google.android.gms.tasks.Task
import kotlinx.coroutines.*
import ru.infoenergo.mis.dbhandler.DBHandlerServerWrite
import ru.infoenergo.mis.dbhandler.DbHandlerLocalRead
import ru.infoenergo.mis.dbhandler.DbHandlerLocalWrite
import ru.infoenergo.mis.helpers.PERMISSIONS
import ru.infoenergo.mis.helpers.TAG_ERR
import java.util.*
import kotlin.concurrent.schedule
import kotlin.random.Random

const val SMS_SENT = "ru.infoenergo.mis.SMS_SENT"
const val SMS_DELIVERED = "ru.infoenergo.mis.SMS_DELIVERED"

/** ********************************************************************** **
 ** Окно с подтверждением телефона/email и ввод кода для подписания акта   **
 ** ********************************************************************** **/
class DlgConfirmationActSign(
    private var phone: String = "", private var email: String = "", private var id_file: Int = 0
) : DialogFragment() {

    private lateinit var tvPhoneConfirm: EditText
    private lateinit var tvEmailConfirm: EditText
    private lateinit var etCodeConfirm: EditText
    private lateinit var btnSendCodeConfirm: Button
    private lateinit var btnCancelConfirm: Button

    private var code: String = ""
    var confirm: Boolean = false

    private lateinit var intentFilter: IntentFilter

    private val viewModelJob = SupervisorJob()
    private val uiScope = CoroutineScope(Dispatchers.Main + viewModelJob)

    override fun onStart() {
        dialog!!.setCanceledOnTouchOutside(false)
        super.onStart()
    }

    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {

        if (ContextCompat.checkSelfPermission(context!!, Manifest.permission.SEND_SMS) != 0) {
            if (!ActivityCompat.shouldShowRequestPermissionRationale(activity!!, Manifest.permission.SEND_SMS)) {
                ActivityCompat.requestPermissions(
                    activity!!,
                    arrayOf(Manifest.permission.SEND_SMS),
                    PERMISSIONS
                )
            }
            dialog!!.cancel()
        }

        val builder = AlertDialog.Builder(activity)

        try {
            // слушатель на кнопку отмены
            // ----------------------------------


            // слушатель на кнопку отправить код
            // ------------------------------------

            btnSendCodeConfirm.setOnClickListener {
                code = Random.nextInt(0, 99999).toString().padStart(5, '0')


                if (sendConfirmationSms()) {
                    Toast.makeText(
                        this@DlgConfirmationActSign.requireContext(),
                        "Код отправлен на ${tvPhoneConfirm.text}",
                        Toast.LENGTH_LONG
                    ).show()
                    btnSendCodeConfirm.isEnabled = false
                    tvPhoneConfirm.isEnabled = false
                    tvEmailConfirm.isEnabled = false
                }
            }

            // ** ****************
            // **   ВВОД КОДА   **
            // ** ****************
            etCodeConfirm.apply {
                visibility = View.VISIBLE
                doOnTextChanged { text, _, _, _ ->
                    if (text!!.length == 5 && text.toString() != code) {
                        this.error = "НЕ верно введён код!"
                    }
                    if (text.toString() == code) {
                        confirm = true
                        dialog!!.cancel()
                    }
                }
            }
        } catch (e: Exception) {
            println("$TAG_ERR DlgConfirmActSign: ${e.message}")
        }
        builder.setView(view)
        return builder.create()
    }

    // Отправить смс с кодом подтверждения
    // ---------------------------------------------------------------
    private fun sendConfirmationSms(): Boolean {
        if (!android.util.Patterns.PHONE.matcher(tvPhoneConfirm.text).matches()) {
            tvPhoneConfirm.error = "Не правильно введён номер телефона!"
            return false
        }

        if (tvPhoneConfirm.text.toString().isEmpty())
            return false

        try {
            val client = SmsRetriever.getClient(context!!)
            val task: Task<Void> = client.startSmsRetriever()

            task.addOnSuccessListener {
                println("$TAG_ERR Successfully started retriever, expect broadcast intent ")
            }

            task.addOnFailureListener {
                println("$TAG_ERR Failed to start retriever, inspect Exception for more details")
            }

            val smsManager = SmsManager.getDefault()

            intentFilter = IntentFilter(SMS_SENT)
            intentFilter.addAction(SMS_DELIVERED)

            val sentIntent = Intent(SMS_SENT)
            val deliveredIntent = Intent(SMS_DELIVERED)

            sentIntent.putExtra("number", tvPhoneConfirm.text.toString())
            sentIntent.putExtra("message", code)
            deliveredIntent.putExtra("number", tvPhoneConfirm.text.toString())
            deliveredIntent.putExtra("message", code)

            val sentPI = PendingIntent.getBroadcast(context!!, 0, sentIntent, PendingIntent.FLAG_ONE_SHOT)
            val deliveredPI = PendingIntent.getBroadcast(
                context!!, 0, deliveredIntent, PendingIntent.FLAG_ONE_SHOT
            )

            val resultsReceiver = SmsReceiver()
            LocalBroadcastManager.getInstance(context!!).registerReceiver(resultsReceiver, intentFilter)
            /*  val messageInBytes = ("<#> $code").toByteArray()
              smsManager.sendDataMessage(
                  etPhoneConfirm.text.toString(),
                  null,
                  8901,
                  messageInBytes,
                  sentPI,
                  deliveredPI
              )*/

            smsManager.sendTextMessage(
                tvPhoneConfirm.text.toString(), null, "<#> Код для подписания акта: $code", sentPI, deliveredPI
            )

            return true
        } catch (ex: java.lang.Exception) {
            println("$TAG_ERR DldSendSms: ${ex.message}")
            ex.printStackTrace()
            return false
        }
    }

    // Отправить email с кодом подтверждения
    // ---------------------------------------------------------------
    private suspend fun sendConfirmationEmail(): Boolean {
        if (!android.util.Patterns.EMAIL_ADDRESS.matcher(tvEmailConfirm.text).matches()) {
            tvEmailConfirm.error = "Не правильно введён email"
            return false
        }
        if (tvEmailConfirm.text.isEmpty()) {
            tvEmailConfirm.error = "Не правильно введён email"
            return false
        }
        try {
            val ctx = this.requireContext()
            return withContext(Dispatchers.IO) {
                DBHandlerServerWrite(ctx).sendCodeEmailAsync(tvEmailConfirm.text.toString(), code).ok
            }
            /* val sender = GMailSender2(
                 resources.getString(R.string.email_for_act_sign),
                 resources.getString(R.string.password_for_act_sign)
             )

             sender.sendMail(
                 "Код подтверждения для подписания акта", code,
                 resources.getString(R.string.email_for_act_sign), tvEmailConfirm.text.toString()
             )*/
        } catch (e: java.lang.Exception) {
            println("$TAG_ERR sendConfirmationEmail: ${e.message}")
            return false
        }
    }

    // Отправить email с подписанным актом и файлами
    // ---------------------------------------------
    suspend fun sendSignedAct(): Boolean {
        if (!android.util.Patterns.EMAIL_ADDRESS.matcher(tvEmailConfirm.text).matches()) {
            tvEmailConfirm.error = "Не правильно введён email"
            return false
        }
        if (tvEmailConfirm.text.isEmpty()) {
            tvEmailConfirm.error = "Не правильно введён email"
            return false
        }
        try {
            val ctx = this.requireContext()
            val db = DbHandlerLocalRead(ctx, null)
            val file = db.getFile(id_file)
            db.close()


            // Сначала находим связанные с актом файлы (фотографии), отправляем их на сервер
            // -----------------------------------------------------------------------------
            val resAddFileAsync = withContext(Dispatchers.IO) {
                val dbRead = DbHandlerLocalRead(ctx, null)
                val dbWrite = DbHandlerLocalWrite(ctx, null)
                try {
                    val files = dbRead.getFilesToSend(file.id_task, file.id_act, file.npp, file.id_file)

                    files.forEach {
                        if (DBHandlerServerWrite(ctx).addFileAsync(it)) {
                            dbWrite.updateFileSend(it.id_file)
                        }
                    }

                    dbRead.close()
                    dbWrite.close()
                    true
                } catch (e: Exception) {
                    dbRead.close()
                    dbWrite.close()
                    println("$TAG_ERR sendEmail: ${e.message}")
                    false
                }
            }

            return if (resAddFileAsync) {
                var res = false
                withContext(Dispatchers.IO) {
                    Timer().schedule(2000) {
                        res = DBHandlerServerWrite(ctx).sendActAsync(file).ok
                    }
                }
                res
            } else {
                false
            }

            /* val a = async(Dispatchers.IO){
                 DBHandlerServerWrite(ctx).sendActAsync(file)
             }.await()*/

            /* withContext(Dispatchers.IO) {
                 try {
                     val sender = GMailSender2(
                         resources.getString(R.string.email_for_act_sign),
                         resources.getString(R.string.password_for_act_sign)
                     )
                     if (file.uri == null) {
                         file.uri = downloadPdf(
                             this@DlgConfirmationActSign.requireContext(),
                             file.filedata!!,
                             file.filename,
                             file.id_task

                         ).toUri()
                     }

                     sender.sendMailPdf(
                         "Подписанный акт", "Подписанный акт ${file.filename}", file.uri.toString(),
                         resources.getString(R.string.email_for_act_sign), tvEmailConfirm.text.toString()
                     )
                     return@withContext
                 } catch (e: java.lang.Exception) {
                     println("$TAG_ERR sendEmail: ${e.message}")
                     return@withContext
                 }
             }*/
        } catch (e: java.lang.Exception) {
            println("$TAG_ERR sendEmail: ${e.message}")
            return false
        }
        //return true
    }

    override fun onCancel(dialog: DialogInterface) {
        super.onCancel(dialog)
        val activity: Activity? = activity
        if (activity is DialogInterface.OnCancelListener) {
            (activity as DialogInterface.OnCancelListener).onCancel(dialog)
        }
    }
}
