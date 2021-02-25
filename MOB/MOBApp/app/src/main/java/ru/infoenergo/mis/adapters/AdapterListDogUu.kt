package ru.infoenergo.mis.adapters

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import android.widget.TextView
import ru.infoenergo.mis.helpers.DogUu
import ru.infoenergo.mis.R
import ru.infoenergo.mis.helpers.TAG_ERR
import java.util.*

/** ***************************************************** **/
/**       Адаптер для listview УУ договора абонента      **/
/** **************************************************** **/
class AdapterListDogUu(
    private val context: Context,
    private val dataSource: ArrayList<DogUu>?
) : BaseAdapter() {

    private val inflater: LayoutInflater = context.getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater

    override fun getView(position: Int, convertView: View?, parent: ViewGroup?): View {
        var view = convertView
        var viewHolderDogUu = ViewHolderDogUu()
        
        try {
            val item = getItem(position)

            // заполнение текствьюеров значениями из списка
            viewHolderDogUu.name?.text = "${item.kod_uu}; ${item.name.replace("null", "")}"
            viewHolderDogUu.mestoUu?.text = item.mesto_uu.replace("null", "")
            viewHolderDogUu.timeUu?.text = item.time_uu.replace("null", "")
            viewHolderDogUu.kodDog?.text = item.kod_dog.toString().replace("null", "")

        } catch (e: Exception) {
            println("$TAG_ERR AdapterListDogUu: ${e.message}")
        }
        return view!!
    }


    override fun getItem(position: Int): DogUu {
        return dataSource!![position]
    }

    override fun getItemId(position: Int): Long {
        return position.toLong()
    }

    override fun getCount(): Int {
        return dataSource!!.size
    }

    // эти два метода решили проблему "перемешивания" элементов листвью
    override fun getViewTypeCount(): Int {
        return if (count == 0) super.getViewTypeCount() else count
    }

    // эти два метода решили проблему "перемешивания" элементов листвью
    override fun getItemViewType(position: Int): Int {
        return position
    }

}

class ViewHolderDogUu(
    var kodDog: TextView? = null,
    var name: TextView? = null,
    var mestoUu: TextView? = null,
    var timeUu: TextView? = null
)
