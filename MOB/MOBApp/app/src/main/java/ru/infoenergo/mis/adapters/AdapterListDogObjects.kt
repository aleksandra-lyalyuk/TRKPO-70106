package ru.infoenergo.mis.adapters

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import android.widget.TextView
import ru.infoenergo.mis.helpers.DogObject
import ru.infoenergo.mis.R
import java.util.*

/** ***************************************************** **/
/**     Адаптер для listview объектов договора абонента   **/
/** **************************************************** **/
class AdapterListDogObjects(
    private val context: Context,
    private val dataSource: ArrayList<DogObject>?
) : BaseAdapter() {

    private val inflater: LayoutInflater = context.getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater

    override fun getView(position: Int, convertView: View?, parent: ViewGroup?): View {
        var view = convertView
        var viewHolderDogObject: ViewHolderDogObject = ViewHolderDogObject()

        try {
            val item = getItem(position)

            // заполнение текствьюеров значениями из списка
            viewHolderDogObject.name?.text = item.name
            viewHolderDogObject.adr?.text = item.adr

        } catch (e: Exception) {
            val r = e.message
        }
        return view!!
    }


    override fun getItem(position: Int): DogObject {
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

class ViewHolderDogObject(
    var name: TextView? = null,
    var adr: TextView? = null
)
